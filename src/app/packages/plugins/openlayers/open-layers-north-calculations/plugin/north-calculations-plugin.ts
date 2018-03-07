import proj from 'ol/proj';
import { EventEmitter } from '@angular/core';
import { IMapPlugin } from '@ansyn/imagery';
import { toDegrees } from '@ansyn/core/utils/math';

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

	getCorrectedNorthOnce(mapObject): Promise<INorthData> {
		const size = mapObject.getSize();
		const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
		const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);


		if (!olCenterView) {
			return Promise.reject('no coordinate for pixel');
		}

		const view = mapObject.getView();
		const projection = view.getProjection();
		return this.projectPoints(projection.getCode(), 'EPSG:4326', [olCenterView, olCenterViewWithOffset]).then((projectedPoints: any[]) => {
			const projectedCenterView = projectedPoints[0];
			const projectedCenterViewWithOffset = projectedPoints[1];

			const northAngleRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
			const northAngleDeg = toDegrees(northAngleRad);

			const view = mapObject.getView();
			const actualNorth = northAngleRad + view.getRotation();

			const eventArgs: INorthData = {
				northOffsetRad: northAngleRad,
				northOffsetDeg: northAngleDeg,
				actualNorth: actualNorth
			};
			return Promise.resolve(eventArgs);
		});
	}

// override this method
	projectPoints(formProjection: string, toProjection: string, points: any[]): Promise<any[]> {
		const result = [];
		points.forEach((point) => {
			const projectedPoint = proj.transform(point, formProjection, toProjection);
			result.push(projectedPoint);
		});
		return Promise.resolve(result);
	}

	setCorrectedNorth(mapObject, retryNumber = 0): Promise<number> {
		if (retryNumber === this.maxNumberOfRetries) {
			return;
		}
		const view = mapObject.getView();
		return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
			view.setRotation(northData.actualNorth);
			mapObject.renderSync();
			if (Math.abs(northData.northOffsetDeg) < this.thresholdDegrees) {
				return northData.actualNorth;
			}
			return this.setCorrectedNorth(mapObject, retryNumber + 1);
		}, (result) => {
			return Promise.reject(result);
		});
	}
}
