import { center, polygon } from '@turf/turf';
import { Feature, Polygon } from 'geojson';
import { ImageryMapExtent, ImageryMapExtentPolygon } from '../model/case-map-position.model';
import { toRadians } from './math';

// @dynamic
export class ExtentCalculator {

	static polygonToExtent(extentPolygon: ImageryMapExtentPolygon): ImageryMapExtent {
		return <ImageryMapExtent>[...extentPolygon.coordinates[0][0], ...extentPolygon.coordinates[0][2]];
	}

	static extentToPolygon(extent: ImageryMapExtent): Feature<Polygon> {
		const minX = extent[0];
		const minY = extent[1];
		const maxX = extent[2];
		const maxY = extent[3];

		const coordinates = [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]];

		return polygon([coordinates]);
	}

	static calcRotation(extentPolygon: ImageryMapExtentPolygon) {
		// topLeft , topRight
		const [[[x1, y1], [x2, y2]]] = extentPolygon.coordinates;
		let theta = Math.atan2(x1 - x2, y1 - y2);
		theta += Math.PI / 2.0;
		const radRotate = toRadians(360);
		return (radRotate - theta) % radRotate;
	}

	static calcCenter(extentPolygon: ImageryMapExtentPolygon): [number, number] {
		const type = 'Feature';
		const properties = {};
		const geometry = extentPolygon;
		return <[number, number]>center(<any>{ type, geometry, properties }).geometry.coordinates;
	}

	static calcResolution(extentPolygon: ImageryMapExtentPolygon, mapSize: [number, number], rotation: number) {
		const [width, height] = mapSize;
		const [[topLeft, topRight, bottomRight, bottomLeft]] = extentPolygon.coordinates;
		const size = width * Math.cos(rotation) + height * Math.sin(rotation);
		const xWidth = bottomRight[0] - topLeft[0];
		return xWidth / size;
	}

}
