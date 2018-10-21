import {
	areCoordinatesNumeric,
	BackToWorldSuccess,
	BackToWorldView,
	CaseOrientation,
	CoreActionTypes,
	ICaseMapPosition, ICaseMapState,
	IOverlay,
	LoggerService,
	toDegrees
} from '@ansyn/core';
import { forkJoin, Observable, Observer, of } from 'rxjs';
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
import { BaseImageryPlugin, CommunicatorEntity, ImageryPlugin, ProjectionService } from '@ansyn/imagery';
import { comboBoxesOptions, IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';
import { IMapState, MapFacadeService, mapStateSelector, selectActiveMapId } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';
import { catchError, distinctUntilChanged, filter, map, mergeMap, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Actions, LoggerService, Store, ProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled = true;

	protected thresholdDegrees = 0.1;

	@AutoSubscription
	baseMap$ = this.store$
		.pipe(
			select(mapStateSelector),
			map(({ mapsList }: IMapState) => MapFacadeService.mapById(mapsList, this.mapId)),
			filter(Boolean),
			map((map: ICaseMapState) => map.data.overlay),
			distinctUntilChanged(),
			tap((overlay) => {
				if (Boolean(overlay)) {
					this.isEnabled = true;
				} else {
					this.isEnabled = false;
					this.communicator.setVirtualNorth(0);
				}
			})
		);

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
			return this.getVirtualNorth().pipe(take(1)).pipe(
				tap((virtualNorth: number) => {
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
	positionChanged$ = () => this.communicator.positionChanged.pipe(
		tap((position: ICaseMapPosition) => {
			if (this.isEnabled && position) {
				this.getVirtualNorth().pipe(take(1)).subscribe((virtualNorth: number) => {
					// console.log(`after position chenged virtualNorth= '${toDegrees(virtualNorth)}'`);
					this.communicator.setVirtualNorth(virtualNorth);
				});
			}
		})
	);

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

	getVirtualNorth() {
		return this.getProjectedCenters().pipe(
			map((projectedCenters: Point[]): number => {
				// console.log(`----------------------------------------`);
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				// console.log(`northOffset= '${toDegrees(northOffsetRad)}'`);
				const northRad = northOffsetRad * -1;
				const communicatorRad = this.communicator.getRotation();
				let currentRotationDegrees = toDegrees(communicatorRad);
				if (currentRotationDegrees < 0) {
					currentRotationDegrees = 360 + currentRotationDegrees;
				}
				currentRotationDegrees = currentRotationDegrees % 360;
				// console.log(`mapRotationDegrees= '${currentRotationDegrees}'`);
				let northDeg = toDegrees(northRad);
				if (northDeg < 0) {
					northDeg = 360 + northDeg;
				}
				northDeg = northDeg % 360;
				// console.log(`calcedNorthDegrees= '${toDegrees(northRad)}'`);
				if (this.thresholdDegrees > Math.abs(currentRotationDegrees - northDeg)) {
					return 0;
				}
				return (this.communicator.getRotation() - northRad) % (Math.PI * 2);
			}),
			catchError(() => of(0))
		);
	}

	projectPoints(coordinates: ol.Coordinate[], projection?: string): Observable<Point[] | any> {
		return forkJoin(coordinates.map((coordinate) => {
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
			.pipe(switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers, projection)));
	}
}
