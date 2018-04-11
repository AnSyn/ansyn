import { EventEmitter, Injectable } from '@angular/core';
import { BaseImageryPlugin, CommunicatorEntity } from '@ansyn/imagery';
import { toDegrees } from '@ansyn/core/utils/math';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Actions } from '@ngrx/effects';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import {
	BackToWorldSuccess,
	BackToWorldView,
	CaseOrientation,
	CoreActionTypes,
	LoggerService,
	Overlay
} from '@ansyn/core';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/retry';
import { Observer } from 'rxjs/Observer';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export interface INorthData {
	northOffsetDeg: number;
	northOffsetRad: number;
	actualNorth: number;
}

@Injectable()
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	static supported = [OpenlayersMapName];
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
			const view = this.iMap.mapObject.getView();
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
			if (!olCenterView) {
				observer.error('no coordinate for pixel');
			}
			const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);
			observer.next([olCenterView, olCenterViewWithOffset])
		})
		.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers))
	}

	onInit() {
		const pointNorth = this.actions$
			.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
			.filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.communicator.id)
			.withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
				return [payload.ignoreRotation, comboBoxesProperties.orientation, payload.overlay];
			})
			.switchMap(([ignoreRotation, orientation, overlay]: [boolean, CaseOrientation, Overlay]) => {
				return this.pointNorth()
					.do(virtualNorth => {
						this.communicator.setVirtualNorth(virtualNorth);
						if (!ignoreRotation) {
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
		return this.getCorrectedNorth()
			.do(() => this.iMap.mapObject.getView().setRotation(currentRotation))
			.catch(reason => {
				const error = `setCorrectedNorth failed: ${reason}`;
				this.loggerService.warn(error);
				return Observable.throw(error);
			});
	}

}
