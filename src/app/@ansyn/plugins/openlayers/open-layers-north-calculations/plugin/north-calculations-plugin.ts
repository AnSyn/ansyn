import { EventEmitter, Injectable } from '@angular/core';
import { BaseImageryPlugin, CommunicatorEntity } from '@ansyn/imagery';
import { toDegrees } from '@ansyn/core/utils/math';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import Coordinate = ol.Coordinate;
import { Actions } from '@ngrx/effects';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import {
	BackToWorldSuccess, BackToWorldView, CaseOrientation, CoreActionTypes, LoggerService,
	Overlay
} from '@ansyn/core';
import { Store } from '@ngrx/store';


export interface INorthData {
	northOffsetDeg: number;
	northOffsetRad: number;
	actualNorth: number;
}

@Injectable()
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	onDisposedEvent: EventEmitter<any>;
	communicator: CommunicatorEntity;
	isEnabled: boolean;
	subscribers = [];

	protected maxNumberOfRetries = 10;
	protected thresholdDegrees = 0.1;

	get ActiveMap() {
		return this.communicator.ActiveMap;
	}

	constructor(protected actions$: Actions, public loggerService: LoggerService, public store$: Store<any>) {
		super();
		this.onDisposedEvent = new EventEmitter();
		this.isEnabled = true;
	}

	public init(communicator: CommunicatorEntity): void {
		this.communicator = communicator;
		this.initPluginSubscribers();
	}

	public dispose() {
		this.onDisposedEvent.emit();
		this.subscribers.forEach((subs) => subs.unsubscribe());
		this.subscribers = [];
	}

	getCorrectedNorthOnce(): Observable<INorthData> {
		const mapObject = this.ActiveMap.mapObject;
		const size = mapObject.getSize();
		const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
		const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);


		if (!olCenterView) {
			return Observable.throw('no coordinate for pixel');
		}

		return this.projectPoints([olCenterView, olCenterViewWithOffset]).map((projectedPoints: Point[]) => {
			const projectedCenterView = projectedPoints[0].coordinates;
			const projectedCenterViewWithOffset = projectedPoints[1].coordinates;

			const northAngleRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
			const northAngleDeg = toDegrees(northAngleRad);

			const view = this.ActiveMap.mapObject.getView();
			const actualNorth = northAngleRad + view.getRotation();

			const eventArgs: INorthData = {
				northOffsetRad: northAngleRad,
				northOffsetDeg: northAngleDeg,
				actualNorth: actualNorth
			};
			return eventArgs;
		});
	}

	// override this method
	projectPoints(coordinates: Coordinate[]): Observable<Point[]> {
		const observables = [];

		coordinates.forEach(coordinate => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			observables.push(this.ActiveMap.projectionService.projectAccurately(point, this.ActiveMap));
		});

		return Observable.forkJoin(observables);
	}

	setCorrectedNorth(retryNumber = 0): Promise<number> {
		if (retryNumber === this.maxNumberOfRetries) {
			return;
		}

		return this.getCorrectedNorthOnce().toPromise().then<number>((northData: INorthData) => {
			this.ActiveMap.mapObject.getView().setRotation(northData.actualNorth);
			this.ActiveMap.mapObject.renderSync();
			if (Math.abs(northData.northOffsetDeg) < this.thresholdDegrees) {
				return northData.actualNorth;
			}
			return this.setCorrectedNorth(retryNumber + 1);
		}, (result) => {
			return Promise.reject(result);
		});
	}

	initPluginSubscribers() {
		const pointNorth = this.actions$
			.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
			.filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.communicator.id)
			.withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
				return [payload.ignoreRotation, this.communicator, comboBoxesProperties.orientation, payload.overlay];
			})
			.filter(([ignoreRotation, communicator]: [boolean, CommunicatorEntity, CaseOrientation, Overlay]) => Boolean(communicator) && communicator.activeMapName !== 'disabledOpenLayersMap')
			.switchMap(([ignoreRotation, communicator, orientation, overlay]: [boolean, CommunicatorEntity, CaseOrientation, Overlay]) => {
				return Observable.fromPromise(this.pointNorth(communicator))
					.do(virtualNorth => {
						communicator.setVirtualNorth(virtualNorth);
						if (!ignoreRotation) {
							switch (orientation) {
								case 'Align North':
									communicator.setRotation(virtualNorth);
									break;
								case 'Imagery Perspective':
									communicator.setRotation(overlay.azimuth);
									break;
							}
						}
					});
			}).subscribe();

		const backToWorldSuccessSetNorth = this.actions$
			.ofType<BackToWorldSuccess>(CoreActionTypes.BACK_TO_WORLD_SUCCESS)
			.withLatestFrom(this.store$.select(statusBarStateSelector))
			.do(([{ payload }, { comboBoxesProperties }]: [BackToWorldView, IStatusBarState]) => {
				this.communicator.setVirtualNorth(0);
				switch (comboBoxesProperties.orientation) {
					case 'Align North':
					case 'Imagery Perspective':
						this.communicator.setRotation(0);
				}
			}).subscribe();

		this.subscribers.push(pointNorth, backToWorldSuccessSetNorth)
	}

	pointNorth(comEntity: CommunicatorEntity): Promise<number> {
		comEntity.updateSize();
		return new Promise(resolve => {
			const northPlugin = comEntity.getPlugin<NorthCalculationsPlugin>(NorthCalculationsPlugin);
			if (!northPlugin) {
				resolve(0);
			} else {
				const currentRotation = comEntity.ActiveMap.mapObject.getView().getRotation();
				northPlugin.setCorrectedNorth()
					.then(north => {
						comEntity.ActiveMap.mapObject.getView().setRotation(currentRotation);
						resolve(north);
					}, reason => {
						this.loggerService.warn(`setCorrectedNorth failed: ${reason}`);
					});
			}
		});
	}

}
