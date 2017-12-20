import { toDegrees } from './math';
import proj from 'ol/proj';

export interface INorthData {
	northOffsetDeg: number;
	northOffsetRad: number;
	actualNorth: number;
}

export function getCorrectedNorthOnce(mapObject): Promise<INorthData> {
	const size = mapObject.getSize();
	const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
	const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);

	return this.projectPoints(mapObject, [olCenterView, olCenterViewWithOffset]).then((projectedPoints: any[]) => {
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
export function projectPoints(mapObject: any, points: any[]): Promise<any[]> {
	const view = mapObject.getView();
	const projection = view.getProjection();
	const result = [];
	points.forEach((point) => {
		const projectedPoint = proj.transform(point, projection, 'EPSG:4326');
		result.push(projectedPoint);
	});
	return Promise.resolve(result);
}

export function setCorrectedNorth(mapObject): Promise<INorthData> {
	const view = mapObject.getView();
	return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
		view.setRotation(northData.actualNorth);
		mapObject.renderSync();
		return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
			view.setRotation(northData.actualNorth);
			mapObject.renderSync();
			return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
				view.setRotation(northData.actualNorth);
				mapObject.renderSync();
				return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
					view.setRotation(northData.actualNorth);
					mapObject.renderSync();
					return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
						view.setRotation(northData.actualNorth);
						mapObject.renderSync();
						return this.getCorrectedNorthOnce(mapObject).then((northData: INorthData) => {
							view.setRotation(northData.actualNorth);
							return Promise.resolve(northData);
						});
					});
				});
			});
		});
	});
}
