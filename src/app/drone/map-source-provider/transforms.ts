import proj4 from 'proj4';
import { mat3 } from 'gl-matrix';
import dlt from 'dltjs';
import * as math from 'mathjs';

interface ITransformer {
	EPSG3857: any;
	EPSG4326: any;
}

function convertPixels(mapCoordinates, x, y) {
	let r = math.inv(mapCoordinates);
	const p = [x, y];
	const geo = dlt.transform2d(r, p);
	return geo;
}

function convertCoordinates(mapCoordinates, lon, lat) {
	let p = [lon, lat];
	const pixels = dlt.transform2d(mapCoordinates, p);
	return pixels;
}

function createMapMatrix(boundary: Array<Array<number>>, width: number, height: number) {
	const topLeft = proj4('EPSG:4326', 'EPSG:3857', boundary[0]);
	const topRight = proj4('EPSG:4326', 'EPSG:3857', boundary[1]);
	const bottomRight = proj4('EPSG:4326', 'EPSG:3857', boundary[2]);
	const bottomLeft = proj4('EPSG:4326', 'EPSG:3857', boundary[3]);

	const IMAGE_MATRIX = [
		[0, height],
		[width, height],
		[width, 0],
		[0, 0],
	];

	const WORLD_MATRIX = [
		[topLeft[0], topLeft[1]],
		[topRight[0], topRight[1]],
		[bottomRight[0], bottomRight[1]],
		[bottomLeft[1], bottomLeft[1]]
	];

	const A = dlt.dlt2d(WORLD_MATRIX, IMAGE_MATRIX);
	return A;
}

export const FROMPIXEL = 'fromPixel';
export const FROMCOORDINATES = 'fromCoordinates';

export function createTransform(code: string, boundary: Array<Array<number>>, width: number, height: number): ITransformer {
	const mapMatrix = createMapMatrix(boundary, width, height);
	const PIXEL2EPSG = (coords) => {
		return convertPixels(mapMatrix, coords[0], coords[1]);
	};
	const EPSG2PIXEL = (coords) => {
		return convertCoordinates(mapMatrix, coords[0], coords[1]);
	};

	return {
		EPSG3857: (type, coords) => {
			if (type === FROMPIXEL) {
				return PIXEL2EPSG(coords);
			} else {
				return EPSG2PIXEL(coords);
			}
		},
		EPSG4326: (type, ...coords) => {
			if (type === FROMPIXEL) {
				const newCoords = PIXEL2EPSG(coords);
				const result = proj4('EPSG:3857', 'EPSG:4326', newCoords);
				return result;
			} else {
				const newCoords = proj4('EPSG:4326', 'EPSG:3857', coords);
				return EPSG2PIXEL(newCoords);
			}
		}
	};
}
