import { toDegrees } from '@ansyn/core/utils/math';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions } from '@ngrx/effects';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/retry';
import { Observer } from 'rxjs/Observer';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import {
	OpenLayersMap,
	OpenlayersMapName
} from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { IMap } from '@ansyn/imagery/model/imap';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CaseOrientation } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { BackToWorldSuccess, BackToWorldView, CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { SetIsVisibleAcion } from '@ansyn/map-facade/actions/map.actions';
import { areCoordinatesNumeric } from '@ansyn/core/utils/geo';

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

	constructor(protected actions$: Actions,
				public loggerService: LoggerService,
				public store$: Store<any>,
				protected projectionService: ProjectionService) {
		super();
	}

	getCorrectedNorth(): Observable<INorthData> {
		return this.getProjectedCenters()
			.map((projectedCenters: Point[]): INorthData => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				const northOffsetDeg = toDegrees(northOffsetRad);
				const view = (<IMap>this.iMap).mapObject.getView();
				const actualNorth = northOffsetRad + view.getRotation();
				return { northOffsetRad, northOffsetDeg, actualNorth };
			})
			.mergeMap((northData: INorthData) => {
				this.iMap.mapObject.getView().setRotation(northData.actualNorth);
				this.iMap.mapObject.renderSync();
				if (Math.abs(northData.northOffsetDeg) > this.thresholdDegrees) {
					return Observable.throw({ result: northData.actualNorth });
				}
				return Observable.of(northData.actualNorth);
			})
			.retry(this.maxNumberOfRetries)
			.catch((e) => e.result ? Observable.of(e.result) : Observable.throw(e));
	}

	projectPoints(coordinates: ol.Coordinate[]): Observable<Point[]> {
		return Observable.forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			return this.projectionService.projectAccurately(point, this.iMap);
		}));
	}

	getProjectedCenters(): Observable<Point[]> {
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
			.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers));
	}

	onInit() {
		const pointNorth = this.actions$
			.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
			.filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.communicator.id)
			.withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
				return [payload.forceFirstDisplay, comboBoxesProperties.orientation, payload.overlay];
			})
			.switchMap(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, Overlay]) => {
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
			}).subscribe();

		const backToWorldSuccessSetNorth = this.actions$
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
			}).subscribe();

		this.subscriptions.push(pointNorth, backToWorldSuccessSetNorth);
	}

	pointNorth(): Observable<any> {
		this.communicator.updateSize();
		const currentRotation = this.iMap.mapObject.getView().getRotation();
		return Observable.of(this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: false })))
			.mergeMap(() => this.getCorrectedNorth())
			.do(() => {
				this.iMap.mapObject.getView().setRotation(currentRotation);
				this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: true }));
			})
			.catch(reason => {
				const error = `setCorrectedNorth failed: ${reason}`;
				this.loggerService.warn(error);
				this.store$.dispatch(new SetIsVisibleAcion({ mapId: this.mapId, isVisible: true }));
				return Observable.throw(error);
			});
	}

}
