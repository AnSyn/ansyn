import {
	areCoordinatesNumeric,
	BackToWorldSuccess,
	BackToWorldView,
	CaseOrientation,
	CoreActionTypes,
	ICaseMapPosition,
	IOverlay,
	LoggerService,
	toDegrees
} from '@ansyn/core';
import { forkJoin, Observable, Observer, of, throwError } from 'rxjs';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions, ofType } from '@ngrx/effects';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	selectHoveredOverlay
} from '@ansyn/overlays';
import { select, Store } from '@ngrx/store';
import { BaseImageryMap, BaseImageryPlugin, CommunicatorEntity, ImageryPlugin, ProjectionService } from '@ansyn/imagery';
import { comboBoxesOptions, IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';
import { MapActionTypes, PointToRealNorthAction, selectActiveMapId } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';
import { catchError, filter, map, mergeMap, retry, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Actions, LoggerService, Store, ProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled = true;

	protected maximumNumberOfRetries = 0.1;
	protected thresholdDegrees = 0.1;

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
		switchMap(([action]: [PointToRealNorthAction]) => {
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
			return this.getVirtualNorth().pipe(take(1)).pipe(
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
		ofType<BackToWorldSuccess>(CoreActionTypes.BACK_TO_WORLD_SUCCESS),
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

	@AutoSubscription
	positionChangedCalcNorthApproximately$ = () => this.communicator.positionChanged.pipe(
		mergeMap((position: ICaseMapPosition) => {
			const view = this.communicator.ActiveMap.mapObject.getView();
			const projection = view.getProjection();
			if (projection.getUnits() === 'pixels' && position) {
				return this.getVirtualNorth(projection.getCode(), 'EPSG:4326').pipe(take(1));
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
				protected projectionService: ProjectionService) {
		super();
	}

	setActualNorth(): Observable<any> {
		return this.pointNorth().pipe(take(1)).pipe(
			tap((virtualNorth: number) => {
				this.communicator.setVirtualNorth(virtualNorth);
				this.communicator.setRotation(virtualNorth);
			})
		);
	}

	pointNorth(): Observable<any> {
		this.communicator.updateSize();
		return this.getCorrectedNorth().pipe(
			catchError(reason => {
				const error = `setCorrectedNorth failed ${reason}`;
				this.loggerService.warn(error);
				return throwError(error);
			})
		);
	}

	getCorrectedNorth(): Observable<any> {
		return this.getProjectedCenters().pipe(
			map((projectedCenters: Point[]): any => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithoffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithoffset[0] - projectedCenterView[0]), (projectedCenterViewWithoffset[1] - projectedCenterView[1]));

				const northOffsetDeg = toDegrees(northOffsetRad);
				const view = (<BaseImageryMap>this.iMap).mapObject.getView();
				const actualNorth = northOffsetRad + view.getRotation();
				return { northOffsetRad, northOffsetDeg, actualNorth };
			}),
			mergeMap((northData) => {
				const view = this.iMap.mapObject.getView();
				view.setRotation(northData.actualNorth);
				this.iMap.mapObject.renderSync();
				if (Math.abs(northData.northOffsetDeg) > this.thresholdDegrees) {
					return throwError({result: northData.actualNorth });
				}
				return of(northData.actualNorth);
			}),
			retry(this.maximumNumberOfRetries),
			catchError((e) => e.result ? of(e.result): throwError(e))
		);
	}

	getPreviewNorth(sourceProjection: string, destProjection: string) {
		return this.getProjectedCenters(sourceProjection, destProjection).pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				return northOffsetRad;
			})
		);
	}

	getVirtualNorth(sourceProjection?: string, destProjection?: string) {
		return this.getProjectedCenters(sourceProjection, destProjection).pipe(
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

	projectPoints(coordinates: ol.Coordinate[], sourceProjection: string, destProjection: string): Observable<Point[] | any> {
		return forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			if (sourceProjection && destProjection) {
				return this.projectionService.projectApproximatelyFromProjection(point, sourceProjection, destProjection);
			}
			return this.projectionService.projectAccurately(point, this.iMap);
		}));
	}

	getProjectedCenters(sourceProjection?: string, destProjection?: string): Observable<Point[]> {
		return Observable.create((observer: Observer<any>) => {
			const mapObject = this.iMap.mapObject;
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
			.pipe(switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers, sourceProjection, destProjection)));
	}
}
