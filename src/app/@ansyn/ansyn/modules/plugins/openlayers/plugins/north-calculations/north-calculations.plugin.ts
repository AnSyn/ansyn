import { forkJoin, Observable, Observer, of, throwError } from 'rxjs';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import {
	areCoordinatesNumeric,
	BaseImageryPlugin,
	CommunicatorEntity,
	ImageryMapPosition,
	ImageryPlugin
} from '@ansyn/imagery';
import { IStatusBarState, statusBarStateSelector } from '../../../../status-bar/reducers/status-bar.reducer';
import {
	BackToWorldSuccess,
	BackToWorldView,
	MapActionTypes,
	PointToRealNorthAction,
	selectActiveMapId
} from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap, toDegrees, toRadians } from '@ansyn/ol';
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
import { OpenLayersProjectionService } from '@ansyn/ol';
import { comboBoxesOptions } from '../../../../status-bar/models/combo-boxes.model';
import { LoggerService } from '../../../../core/services/logger.service';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes
} from '../../../../overlays/actions/overlays.actions';
import { selectHoveredOverlay } from '../../../../overlays/reducers/overlays.reducer';
import { CaseOrientation } from '../../../../../../../app/cases/models/case.model';
import { IOverlay } from '../../../../overlays/models/overlay.model';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Actions, LoggerService, Store, OpenLayersProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled = true;

	protected maximumNumberOfRetries = 0.1;
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
	calcNorthAfterDisplayOverlaySuccess$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.mapId),
		withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
			return [payload.forceFirstDisplay, comboBoxesProperties.orientation, payload.overlay];
		}),
		filter(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, IOverlay]) => {
			return comboBoxesOptions.orientations.includes(orientation);
		}),
		switchMap(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, IOverlay]) => {
			if (orientation === 'Align North' && !forceFirstDisplay) {
				return this.setActualNorth();
			}
			return this.getVirtualNorth(this.iMap.mapObject).pipe(take(1)).pipe(
				tap((virtualNorth: number) => {
					this.communicator.setVirtualNorth(virtualNorth);
					if (!forceFirstDisplay && orientation === 'Imagery Perspective') {
						this.communicator.setRotation(overlay.azimuth);
					}
				}));
		})
	);

	@AutoSubscription
	backToWorldSuccessSetNorth$ = this.actions$.pipe(
		ofType<BackToWorldSuccess>(MapActionTypes.BACK_TO_WORLD_SUCCESS),
		filter((action: BackToWorldSuccess) => action.payload.mapId === this.communicator.id),
		withLatestFrom(this.store$.select(statusBarStateSelector)),
		tap(([action, { comboBoxesProperties }]: [BackToWorldView, IStatusBarState]) => {
			this.communicator.setVirtualNorth(0);
			switch (comboBoxesProperties.orientation) {
				case 'Align North':
				case 'Imagery Perspective':
					this.communicator.setRotation(0);
			}
		})
	);

	// @AutoSubscription
	// positionChangedCalcNorthApproximately$ = () => this.communicator.positionChanged.pipe(
	// 	debounceTime(50),
	// 	switchMap((position: ImageryMapPosition) => {
	// 		const view = this.communicator.ActiveMap.mapObject.getView();
	// 		const projection = view.getProjection();
	// 		if (projection.getUnits() === 'pixels' && position) {
	// 			return this.getVirtualNorth(this.iMap.mapObject, projection.getCode(), 'EPSG:4326').pipe(take(1));
	// 		}
	// 		return of(0);
	// 	}),
	// 	tap((virtualNorth: number) => {
	// 		this.communicator.setVirtualNorth(virtualNorth);
	// 	})
	// );

	@AutoSubscription
	positionChangedCalcNorthAccurately$ = () => this.communicator.positionChanged.pipe(
		debounceTime(50),
		switchMap((position: ImageryMapPosition) => {
			const view = this.iMap.mapObject.getView();
			const projection = view.getProjection();
			if (projection.getUnits() === 'pixels' && position) {
				if (!position.projectedState) {
					return of(0);
				}

				if (!this.shadowMapObject) {
					this.createShadowMap();
					this.resetShadowMapView();
				}
				const { center, zoom, rotation } = position.projectedState;
				this.shadowMapObjectView.setCenter(center);
				this.shadowMapObjectView.setZoom(zoom);
				this.shadowMapObjectView.setRotation(rotation);

				return this.pointNorth(this.shadowMapObject).pipe(take(1)).pipe(
					map((calculatedNorthAngleAfterPointingNorth: number) => {
						const shRotation = this.shadowMapObjectView.getRotation();
						let currentRotationDegrees = toDegrees(shRotation);
						if (currentRotationDegrees < 0) {
							currentRotationDegrees = 360 + currentRotationDegrees;
						}
						currentRotationDegrees = currentRotationDegrees % 360;
						return toRadians(currentRotationDegrees);
					})
				);
			}
			return of(0);
		}),
		tap((virtualNorth: number) => {
			this.communicator.setVirtualNorth(virtualNorth);
		})
	);

	constructor(protected actions$: Actions,
				public loggerService: LoggerService,
				public store$: Store<any>,
				protected projectionService: OpenLayersProjectionService) {
		super();
	}

	setActualNorth(): Observable<any> {
		return this.pointNorth(this.iMap.mapObject).pipe(take(1)).pipe(
			tap((virtualNorth: number) => {
				this.communicator.setVirtualNorth(virtualNorth);
				this.communicator.setRotation(virtualNorth);
			})
		);
	}

	pointNorth(mapObject: OLMap): Observable<any> {
		mapObject.updateSize();
		mapObject.renderSync();
		return this.getCorrectedNorth(mapObject).pipe(
			catchError(reason => {
				const error = `setCorrectedNorth failed ${reason}`;
				this.loggerService.warn(error);
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

	getVirtualNorth(mapObject: OLMap, sourceProjection?: string, destProjection?: string) {
		return this.getProjectedCenters(mapObject, sourceProjection, destProjection).pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				const northRad = northOffsetRad * -1;
				const communicatorRad = this.communicator.getRotation();
				let currentRotationDegrees = toDegrees(communicatorRad);
				if (currentRotationDegrees < 0) {
					currentRotationDegrees = 360 + currentRotationDegrees;
				}
				currentRotationDegrees = currentRotationDegrees % 360;
				let northDeg = toDegrees(northRad);
				if (northDeg < 0) {
					northDeg = 360 + northDeg;
				}
				northDeg = northDeg % 360;
				if (this.thresholdDegrees > Math.abs(currentRotationDegrees - northDeg)) {
					return 0;
				}
				return (this.communicator.getRotation() - northRad) % (Math.PI * 2);
			}),
			catchError(() => of(0))
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
		return Observable.create((observer: Observer<any>) => {
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

	onResetView(): Observable<boolean> {
		if (!this.shadowMapObject) {
			this.createShadowMap();
		}
		this.resetShadowMapView();
		return of(true);
	};

	createShadowMap() {
		const renderer = 'canvas';
		this.shadowMapObject = new OLMap({
			target: (<any>this.iMap).shadowNorthElement,
			renderer,
			controls: []
		});
	}

	resetShadowMapView() {
		const layers = this.shadowMapObject.getLayers();
		layers.forEach((layer) => {
			this.shadowMapObject.removeLayer(layer);
		});
		const mainLayer = this.iMap.getMainLayer();
		this.shadowMapObjectView = new View({
			projection: mainLayer.getSource().getProjection()
		});
		this.shadowMapObject.addLayer(mainLayer);
		this.shadowMapObject.setView(this.shadowMapObjectView);
	}
}
