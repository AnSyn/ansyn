import { EMPTY, forkJoin, Observable, Observer, of, throwError } from 'rxjs';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import {
	areCoordinatesNumeric,
	BaseImageryPlugin,
	CommunicatorEntity,
	getAngleDegreeBetweenPoints,
	IImageryMapPosition,
	ImageryPlugin, MapOrientation,
	toDegrees,
	toRadians
} from '@ansyn/imagery';
import {
	MapActionTypes,
	PointToRealNorthAction,
	selectActiveMapId,
	selectMapPositionByMapId,
	PointToImageOrientationAction,
} from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import {
	catchError,
	debounceTime,
	filter,
	map,
	mergeMap,
	retry,
	switchMap,
	take,
	tap,
	withLatestFrom
} from 'rxjs/operators';

import OLMap from 'ol/Map';
import View from 'ol/View';
import ol_Layer from 'ol/layer/Layer';
import { LoggerService } from '../../../../core/services/logger.service';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes
} from '../../../../overlays/actions/overlays.actions';
import { selectHoveredOverlay } from '../../../../overlays/reducers/overlays.reducer';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import {
	BackToWorldSuccess,
	BackToWorldView,
	OverlayStatusActionsTypes
} from '../../../../overlays/overlay-status/actions/overlay-status.actions';
import { CoreConfig } from '../../../../core/models/core.config';
import { Inject } from '@angular/core';
import { ICoreConfig } from '../../../../core/models/core.config.model';
import { selectMapOrientation } from '@ansyn/map-facade';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Actions, LoggerService, Store, CoreConfig, OpenLayersProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
;
	communicator: CommunicatorEntity;
	isEnabled = true;

	protected maximumNumberOfRetries = 10;
	protected thresholdDegrees = 0.1;

	shadowMapObject: OLMap;
	shadowMapObjectView: View;

	@AutoSubscription
	hoveredOverlayPreview$: Observable<any> = this.store$.select(selectHoveredOverlay).pipe(
		withLatestFrom(this.store$.pipe(select(selectActiveMapId))),
		filter(([overlay, activeMapId]: [IOverlay, string]) => Boolean(overlay) && Boolean(this.communicator) && activeMapId === this.mapId),
		mergeMap(([{ projection }]: [IOverlay, string]) => {
			const view = this.communicator.ActiveMap.mapObject.getView();
			const viewProjection = view.getProjection();
			const sourceProjectionCode = viewProjection.getCode();
			return this.getPreviewNorth(sourceProjectionCode, projection)
				.pipe(catchError(() => of(0)));
		}),
		tap((north: number) => {
			this.store$.dispatch(new ChangeOverlayPreviewRotationAction(-north));
		})
	);

	@AutoSubscription
	pointToRealNorth$ = this.actions$.pipe(
		ofType<PointToRealNorthAction>(MapActionTypes.POINT_TO_REAL_NORTH),
		filter((action: PointToRealNorthAction) => action.payload === this.mapId),
		switchMap((action: PointToRealNorthAction) => {
			return this.setActualNorth();
		})
	);

	@AutoSubscription
	pointToImageOrientation$ = this.actions$.pipe(
		ofType<PointToImageOrientationAction>(MapActionTypes.POINT_TO_IMAGE_ORIENTATION),
		filter((action: PointToImageOrientationAction) => action.payload.mapId === this.mapId),
		tap((action: PointToImageOrientationAction) => {
			this.setImageryOrientation(action.payload.overlay);
		})
	);

	constructor(protected actions$: Actions,
				public loggerService: LoggerService,
				public store$: Store<any>,
				@Inject(CoreConfig) public config: ICoreConfig,
				protected projectionService: OpenLayersProjectionService) {
		super();
	}

	@AutoSubscription
	calcNorthAfterDisplayOverlaySuccess$ = () => this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.mapId),
		withLatestFrom(this.store$.select(selectMapOrientation(this.mapId)), ({ payload }: DisplayOverlaySuccessAction, orientation: MapOrientation) => {
			return [payload.forceFirstDisplay, orientation , payload.overlay, payload.customOriantation];
		}),
		switchMap(([forceFirstDisplay, orientation, overlay, customOriantation]: [boolean, MapOrientation, IOverlay, string]) => {
			// for 'Imagery Perspective' or 'User Perspective'
			return this.positionChangedCalcNorthAccurately$().pipe(take(1)).pipe(
				tap((virtualNorth: number) => {
					this.communicator.setVirtualNorth(virtualNorth);

					if (!forceFirstDisplay && (orientation === 'Imagery Perspective' || customOriantation === 'Imagery Perspective')) {
						this.setImageryOrientation(overlay);
					}
					// else if 'User Perspective' do nothing
				}));
		})
	);

	@AutoSubscription
	backToWorldSuccessSetNorth$ = () => this.actions$.pipe(
		ofType<BackToWorldSuccess>(OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS),
		filter((action: BackToWorldSuccess) => action.payload.mapId === this.communicator.id),
		withLatestFrom(this.store$.select(selectMapOrientation(this.mapId))),
		tap(([action, orientation]: [BackToWorldView, MapOrientation]) => {
			this.communicator.setVirtualNorth(0);
			if (orientation === 'Imagery Perspective') {
				this.communicator.setRotation(0);
			}
		})
	);

	setImageryOrientation(overlay: IOverlay) {
		if (!overlay) {
			return;
		}

		if (overlay.sensorLocation && !this.config.northCalcImagerySensorNamesIgnoreList.includes(overlay.sensorName)) {
			this.communicator.getCenter().pipe(take(1)).subscribe(point => {
				const brng = getAngleDegreeBetweenPoints(overlay.sensorLocation, point);
				const resultBearings = (360 - (brng + toDegrees(-this.communicator.getVirtualNorth()))) % 360;
				this.communicator.setRotation(toRadians(resultBearings));
			});
		} else {
			this.communicator.setRotation(overlay.azimuth);
		}
	}

	@AutoSubscription
	positionChangedCalcNorthAccurately$ = () => this.store$.select(selectMapPositionByMapId(this.mapId)).pipe(
		debounceTime(50),
		filter(Boolean),
		switchMap((position: IImageryMapPosition) => {
			const view = this.iMap.mapObject.getView();
			const projection = view.getProjection();
			if (projection.getUnits() === 'pixels' && position) {
				if (!position.projectedState) {
					return of(0);
				}

				return this.pointNorth(this.shadowMapObject).pipe(take(1)).pipe(
					map((calculatedNorthAngleAfterPointingNorth: number) => {
						const shRotation = this.shadowMapObjectView.getRotation();
						let currentRotationDegrees = toDegrees(shRotation);
						if (currentRotationDegrees < 0) {
							currentRotationDegrees = 360 + currentRotationDegrees;
						}
						currentRotationDegrees = currentRotationDegrees % 360;
						return toRadians(currentRotationDegrees);
					}),
					catchError((error) => of(0)) // prevent's subscriber disappearance
				);
			}
			return of(0);

		})
	);

	setActualNorth(): Observable<any> {
		return this.pointNorth(this.shadowMapObject).pipe(take(1)).pipe(
			tap((virtualNorth: number) => {
				this.communicator.setVirtualNorth(virtualNorth);
				this.communicator.setRotation(virtualNorth);
			}),
			catchError(reason => {
				return EMPTY;
			})
		);
	}

	pointNorth(mapObject: OLMap): Observable<any> {
		mapObject.updateSize();
		mapObject.renderSync();
		return this.getCorrectedNorth(mapObject).pipe(
			catchError(reason => {
				const error = `setCorrectedNorth failed ${reason}`;
				this.loggerService.warn(error, 'map', 'north_plugin');
				return throwError(error);
			})
		);
	}

	getCorrectedNorth(mapObject: OLMap): Observable<any> {
		return this.getProjectedCenters(mapObject).pipe(
			map((projectedCenters: Point[]): any => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithoffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithoffset[0] - projectedCenterView[0]), (projectedCenterViewWithoffset[1] - projectedCenterView[1]));

				const northOffsetDeg = toDegrees(northOffsetRad);
				const view = mapObject.getView();
				const actualNorth = northOffsetRad + view.getRotation();
				return { northOffsetRad, northOffsetDeg, actualNorth };
			}),
			mergeMap((northData) => {
				const view = mapObject.getView();
				view.setRotation(northData.actualNorth);
				mapObject.renderSync();
				if (Math.abs(northData.northOffsetDeg) > this.thresholdDegrees) {
					return throwError({ result: northData.actualNorth });
				}
				return of(northData.actualNorth);
			}),
			retry(this.maximumNumberOfRetries),
			catchError((e) => e.result ? of(e.result) : throwError(e))
		);
	}

	getPreviewNorth(sourceProjection: string, destProjection: string) {
		const mapObject = this.iMap.mapObject;
		return this.getProjectedCenters(mapObject, sourceProjection, destProjection).pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				return northOffsetRad;
			})
		);
	}

	projectPoints(coordinates: [number, number][], sourceProjection: string, destProjection: string): Observable<Point[] | any> {
		return forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point>turf.geometry('Point', coordinate);
			if (sourceProjection && destProjection) {
				return this.projectionService.projectApproximatelyFromProjection(point, sourceProjection, destProjection);
			}
			return this.projectionService.projectAccurately(point, this.iMap.mapObject);
		}));
	}

	getProjectedCenters(mapObject: OLMap, sourceProjection?: string, destProjection?: string): Observable<Point[]> {
		return new Observable((observer: Observer<any>) => {
			const size = mapObject.getSize();
			const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
			if (!areCoordinatesNumeric(olCenterView)) {
				observer.error('no coordinate for pixel');
			}
			const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);
			if (!areCoordinatesNumeric(olCenterViewWithOffset)) {
				observer.error('no coordinate for pixel');
			}
			observer.next([olCenterView, olCenterViewWithOffset]);
		})
			.pipe(switchMap((centers: [number, number][]) => this.projectPoints(centers, sourceProjection, destProjection)));
	}

	onInit() {
		super.onInit();
		this.createShadowMap();
	}

	createShadowMap() {
		if (!this.shadowMapObject) {
			this.createShadowMapObject();
		}
		const view = this.communicator.ActiveMap.mapObject.getView();
		const projectedState = {
			...(<any>view).getState(),
			center: (<any>view).getCenter()
		};
		this.resetShadowMapView(projectedState);
	}

	onResetView(): Observable<boolean> {
		this.createShadowMap();
		return of(true);
	}
	createShadowMapObject() {
		const renderer = 'canvas';
		this.shadowMapObject = new OLMap({
			target: (<any>this.iMap).shadowNorthElement,
			renderer,
			controls: []
		});
	}

	resetShadowMapView(projectedState) {
		const layers = this.shadowMapObject.getLayers();
		layers.forEach((layer) => {
			this.shadowMapObject.removeLayer(layer);
		});
		const mainLayer = this.iMap.getMainLayer() as ol_Layer;
		this.shadowMapObjectView = new View({
			projection: mainLayer.getSource().getProjection()
		});
		this.shadowMapObject.addLayer(mainLayer);
		this.shadowMapObject.setView(this.shadowMapObjectView);

		const { center, zoom, rotation } = projectedState;
		this.shadowMapObjectView.setCenter(center);
		this.shadowMapObjectView.setZoom(zoom);
		this.shadowMapObjectView.setRotation(rotation);
	}
}
