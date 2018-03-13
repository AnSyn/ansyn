import { EventEmitter } from '@angular/core';
import { IMap, IMapPlugin } from '@ansyn/imagery';
import { toDegrees } from '@ansyn/core/utils/math';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import * as turf from '@turf/turf';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import Coordinate = ol.Coordinate;

export const openLayersNorthCalculations = 'openLayersNorthCalculations';

export interface INorthData {
	northOffsetDeg: number;
	northOffsetRad: number;
	actualNorth: number;
}

export class NorthCalculationsPlugin implements IMapPlugin {
	onDisposedEvent: EventEmitter<any>;
	pluginType: string;

	isEnabled: boolean;

	protected maxNumberOfRetries = 10;
	protected thresholdDegrees = 0.1;

	constructor() {
		this.pluginType = openLayersNorthCalculations;

		this.onDisposedEvent = new EventEmitter();
		this.isEnabled = true;
	}

	public init(mapId: string): void {

	}

	public dispose() {
		this.onDisposedEvent.emit();
	}

	getCorrectedNorthOnce(iMap): Observable<INorthData> {
		const mapObject = iMap.mapObject;
		const size = mapObject.getSize();
		const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
		const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);


		if (!olCenterView) {
			return Observable.throw('no coordinate for pixel');
		}

		return this.projectPoints(iMap, [olCenterView, olCenterViewWithOffset]).map((projectedPoints: Point[]) => {
			const projectedCenterView = projectedPoints[0].coordinates;
			const projectedCenterViewWithOffset = projectedPoints[1].coordinates;

			const northAngleRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
			const northAngleDeg = toDegrees(northAngleRad);

			const view = mapObject.getView();
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
	projectPoints(iMap: IMap, coordinates: Coordinate[]): Observable<Point[]> {
		const observables = [];

		coordinates.forEach(coordinate => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			observables.push(iMap.projectionService.projectAccurately(point, iMap));
		});

		return Observable.forkJoin(observables);
	}

	setCorrectedNorth(iMap, retryNumber = 0): Promise<number> {
		if (retryNumber === this.maxNumberOfRetries) {
			return;
		}

		return this.getCorrectedNorthOnce(iMap).toPromise().then((northData: INorthData) => {
			iMap.mapObject.getView().setRotation(northData.actualNorth);
			iMap.mapObject.renderSync();
			if (Math.abs(northData.northOffsetDeg) < this.thresholdDegrees) {
				return northData.actualNorth;
			}
			return this.setCorrectedNorth(iMap, retryNumber + 1);
		}, (result) => {
			return Promise.reject(result);
		});
	}
}
