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
import { forkJoin, Observable, Observer } from 'rxjs';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions, ofType } from '@ngrx/effects';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/retry';
import {
	BaseImageryMap,
	BaseImageryPlugin,
	CommunicatorEntity,
	ImageryPlugin,
	ProjectionService
} from '@ansyn/imagery';
import { comboBoxesOptions, IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';
import { SetIsVisibleAcion } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';
import { catchError, filter, map, mergeMap, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import OLMap from 'ol/map';

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
	pointNorth$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.communicator.id),
		withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
			return [payload.forceFirstDisplay, comboBoxesProperties.orientation, payload.overlay];
		}),
		filter(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, IOverlay]) => {
			return comboBoxesOptions.orientations.includes(orientation);
		}),
		switchMap(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, IOverlay]) => {
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

	constructor(protected actions$: Actions,
				public loggerService: LoggerService,
				public store$: Store<any>,
				protected projectionService: ProjectionService) {
		super();
	}

	getCorrectedNorth(communicator?: CommunicatorEntity): Observable<any> {
		let mapObject = null;
		if (communicator) {
			mapObject  = communicator.ActiveMap.mapObject;
		}
		return this.getProjectedCenters(mapObject).pipe(
			map((projectedCenters: Point[]) => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				if (communicator) {
					return northOffsetRad * -1;
				}
				else {
					const northOffsetDeg = toDegrees(northOffsetRad);
					const view = (<BaseImageryMap>this.iMap).mapObject.getView();
					const actualNorth = northOffsetRad + view.getRotation();
					return { northOffsetRad, northOffsetDeg, actualNorth };
				}
			}),
		);
	}

	projectPoints(coordinates: ol.Coordinate[], previewRotation: boolean): Observable<Point[]> {
		return forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			if (previewRotation) {
				return this.projectionService.projectApproximatelyFromProjection(point, 'EPSG:3857');

			}
			return this.projectionService.projectAccurately(point, this.iMap);
		}));
	}

	getProjectedCenters(mapObject?: OLMap): Observable<Point[]> {
		return Observable.create((observer: Observer<any>) => {
			const size = Boolean(mapObject) ? mapObject.getSize() : this.iMap.mapObject;
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
			.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers, Boolean(mapObject)));
	}

	pointNorth(): Observable<any> {
		this.communicator.updateSize();
		const currentRotation = this.iMap.mapObject.getView().getRotation();
		return Observable.of(this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: false }))).pipe(
			mergeMap(() => this.getCorrectedNorth()),
			tap(() => {
				this.iMap.mapObject.getView().setRotation(currentRotation);
				this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: true }));
			}),
			catchError(reason => {
				const error = `setCorrectedNorth failed: ${reason}`;
				this.loggerService.warn(error);
				this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: true }));
				return Observable.throw(error);
			})
		);
	}
}
