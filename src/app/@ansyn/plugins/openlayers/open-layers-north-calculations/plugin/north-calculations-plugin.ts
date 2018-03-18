import { EventEmitter, Injectable } from '@angular/core';
import { BaseImageryPlugin, CommunicatorEntity } from '@ansyn/imagery';
import { toDegrees } from '@ansyn/core/utils/math';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import Coordinate = ol.Coordinate;


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

	protected maxNumberOfRetries = 10;
	protected thresholdDegrees = 0.1;

	get ActiveMap() {
		return this.communicator.ActiveMap;
	}

	constructor() {
		super();
		this.onDisposedEvent = new EventEmitter();
		this.isEnabled = true;
	}

	public init(communicator: CommunicatorEntity): void {
		this.communicator = communicator;
	}

	public dispose() {
		this.onDisposedEvent.emit();
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
}
