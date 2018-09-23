import {
	areCoordinatesNumeric,
	BackToWorldSuccess,
	BackToWorldView,
	CaseOrientation,
	CoreActionTypes,
	IOverlay,
	LoggerService,
	toDegrees
} from '@ansyn/core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions } from '@ngrx/effects';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	selectHoveredOverlay
} from '@ansyn/overlays';
import { select, Store } from '@ngrx/store';
import 'rxjs/add/operator/retry';
import { Observer } from 'rxjs/Observer';
import {
	BaseImageryMap,
	BaseImageryPlugin,
	CommunicatorEntity,
	ImageryPlugin,
	ProjectionService
} from '@ansyn/imagery';
import { comboBoxesOptions, IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';
import { selectActiveMapId, SetIsVisibleAcion } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';
import { catchError, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

export interface INorthData {
	northOffsetDeg: number;
	northOffsetRad: number;
	actualNorth: number;
}

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Actions, LoggerService, Store, ProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled = true;

	protected maxNumberOfRetries = 10;
	protected thresholdDegrees = 0.1;

	@AutoSubscription
	hoveredOverlayPreview$: Observable<any> = this.store$.select(selectHoveredOverlay).pipe(
		withLatestFrom(this.store$.pipe(select(selectActiveMapId))),
		filter(([overlay, activeMapId]: [IOverlay, string]) => Boolean(overlay) && Boolean(this.communicator) && activeMapId === this.mapId),
		mergeMap(([{ projection }]: [IOverlay, string]) => {
			return this.getPreviewNorth(projection)
				.pipe(
					catchError(() => of(0))
				);
		}),
		tap((north: number) => this.store$.dispatch(new ChangeOverlayPreviewRotationAction(north)))
	);

	@AutoSubscription
	pointNorth$ = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.communicator.id)
		.withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
			return [payload.forceFirstDisplay, comboBoxesProperties.orientation, payload.overlay];
		})
		.filter(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, IOverlay]) => {
			return comboBoxesOptions.orientations.includes(orientation);
		})
		.switchMap(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, IOverlay]) => {
			return this.pointNorth()
				.do(virtualNorth => {
					this.communicator.setVirtualNorth(virtualNorth);
					if (!forceFirstDisplay) {
						switch (orientation) {
							case 'Align North':
								this.communicator.setRotation(virtualNorth);
								break;
							case 'Imagery Perspective':
								this.communicator.setRotation(overlay.azimuth);
								break;
						}
					}
				});
		});

	@AutoSubscription
	backToWorldSuccessSetNorth$ = this.actions$
		.ofType<BackToWorldSuccess>(CoreActionTypes.BACK_TO_WORLD_SUCCESS)
		.filter((action: BackToWorldSuccess) => action.payload.mapId === this.communicator.id)
		.withLatestFrom(this.store$.select(statusBarStateSelector))
		.do(([action, { comboBoxesProperties }]: [BackToWorldView, IStatusBarState]) => {
			this.communicator.setVirtualNorth(0);
			switch (comboBoxesProperties.orientation) {
				case 'Align North':
				case 'Imagery Perspective':
					this.communicator.setRotation(0);
			}
		});

	constructor(protected actions$: Actions,
				public loggerService: LoggerService,
				public store$: Store<any>,
				protected projectionService: ProjectionService) {
		super();
	}

	getPreviewNorth(projection: string) {
		return this.getProjectedCenters(projection).pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				return northOffsetRad * -1;
			})
		);
	}

	getCorrectedNorth(): Observable<INorthData> {
		return this.getProjectedCenters()
			.map((projectedCenters: Point[]): INorthData => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				const northOffsetDeg = toDegrees(northOffsetRad);
				const view = (<BaseImageryMap>this.iMap).mapObject.getView();
				const actualNorth = northOffsetRad + view.getRotation();
				return { northOffsetRad, northOffsetDeg, actualNorth };
			})
			.mergeMap((northData: INorthData) => {
				this.iMap.mapObject.getView().setRotation(northData.actualNorth);
				this.iMap.mapObject.renderSync();
				if (Math.abs(northData.northOffsetDeg) > this.thresholdDegrees) {
					return throwError({ result: northData.actualNorth });
				}
				return of(northData.actualNorth);
			})
			.retry(this.maxNumberOfRetries)
			.catch((e) => e.result ? of(e.result) : throwError(e));
	}

	projectPoints(coordinates: ol.Coordinate[], projection?: string): Observable<Point[] | any> {
		return Observable.forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			if (projection) {
				return this.projectionService.projectApproximatelyFromProjection(point, projection);
			}
			return this.projectionService.projectAccurately(point, this.iMap);
		}));
	}

	getProjectedCenters(projection?: string): Observable<Point[]> {
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
			.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers, projection));
	}

	pointNorth(): Observable<any> {
		this.communicator.updateSize();
		const currentRotation = this.iMap.mapObject.getView().getRotation();
		return of(this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: false }))).pipe(
			mergeMap(() => this.getCorrectedNorth()),
			tap(() => {
				this.iMap.mapObject.getView().setRotation(currentRotation);
				this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: true }));
			}),
			catchError(reason => {
				const error = `setCorrectedNorth failed: ${reason}`;
				this.loggerService.warn(error);
				this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: true }));
				return throwError(error);
			})
		);
	}

}
