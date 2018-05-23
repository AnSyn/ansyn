import { CaseMapExtent, CaseMapExtentPolygon } from '@ansyn/core/models/case-map-position.model';
import { toRadians } from './math';
import { polygon, center } from '@turf/turf';
import { Feature, Polygon } from 'geojson';

export class ExtentCalculator {

	static polygonToExtent(extentPolygon: CaseMapExtentPolygon): CaseMapExtent {
		return <CaseMapExtent> [...extentPolygon.coordinates[0][0], ...extentPolygon.coordinates[0][2]];
	}

	static extentToPolygon(extent: CaseMapExtent): Feature<Polygon> {
		const minX = extent[0];
		const minY = extent[1];
		const maxX = extent[2];
		const maxY = extent[3];

		const coordinates = [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]];

		return polygon([coordinates]);
	}

	/*
	Returns the counter clockwise angle in radians.
	 */
	static calcRotation(extentPolygon: CaseMapExtentPolygon): number {
		const topLeft = extentPolygon.coordinates[0][0];
		const bottomLeft = extentPolygon.coordinates[0][3];
		const diffs = [topLeft[0] - bottomLeft[0], topLeft[1] - bottomLeft[1]];
		let rotation = Math.atan(diffs[0] / diffs[1]);
		if (diffs[1] < 0) {
			rotation += Math.PI;
		} else if (diffs[0] < 0) {
			rotation += (2 * Math.PI);
		}
		return rotation;
	}

	static calcCenter(extentPolygon: CaseMapExtentPolygon): ol.Coordinate {
		const type = 'Feature';
		const properties = {};
		const geometry = extentPolygon;
		return <ol.Coordinate> center(<any> { type, geometry, properties }).geometry.coordinates;
	}

	static calcResolution(extentPolygon: CaseMapExtentPolygon, mapSize: [number, number], rotation: number) {
		const [width, height] = mapSize;
		const [[topLeft, topRight, bottomRight, bottomLeft]] = extentPolygon.coordinates;
		const size = width * Math.cos(rotation) + height * Math.sin(rotation);
		const xWidth = bottomRight[0] - topLeft[0];
		return xWidth / size;
	}

}
