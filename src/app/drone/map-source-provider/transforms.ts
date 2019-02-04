import proj4 from 'proj4';
import { mat3 } from 'gl-matrix';
import dlt from 'dltjs';
import * as math from 'mathjs';

interface ITransformer {
	EPSG3857: any;
	EPSG4326: any;
}

function convertPixels(A, pixels) {
	let r = math.inv(A);
	return dlt.transform2d(r, pixels);

}

function convertCoordinates(A, coords) {
	return dlt.transform2d(A, coords);
}

function createTransformMatrix(boundary: Array<Array<number>>, width: number, height: number) {
	const topLeft = proj4('EPSG:4326', 'EPSG:3857', boundary[0]);
	const topRight = proj4('EPSG:4326', 'EPSG:3857', boundary[1]);
	const bottomRight = proj4('EPSG:4326', 'EPSG:3857', boundary[2]);
	const bottomLeft = proj4('EPSG:4326', 'EPSG:3857', boundary[3]);

	const IMAGE_MATRIX = [
		[0, height],
		[width, height],
		[width, 0],
		[0, 0]
	];

	const WORLD_MATRIX = [
		[topLeft[0], topLeft[1]],
		[topRight[0], topRight[1]],
		[bottomRight[0], bottomRight[1]],
		[bottomLeft[0], bottomLeft[1]]
	];
	return dlt.dlt2d(WORLD_MATRIX, IMAGE_MATRIX);
}

export const FROMPIXEL = 'fromPixel';
export const FROMCOORDINATES = 'fromCoordinates';

export function createTransform(boundary: Array<Array<number>>, width: number, height: number): ITransformer {
	const A = createTransformMatrix(boundary, width, height);
	const PIXEL2EPSG = (coords) => {
		return convertPixels(A, coords);
	};
	const EPSG2PIXEL = (coords) => {
		return convertCoordinates(A, coords);
	};

	return {
		EPSG3857: (type, ...coords) => {
			if (type === FROMPIXEL) {
				return PIXEL2EPSG(coords);
			} else {
				return EPSG2PIXEL(coords);
			}
		},
		EPSG4326: (type, ...coords) => {
			if (type === FROMPIXEL) {
				const newCoords = PIXEL2EPSG(coords);
				return proj4('EPSG:3857', 'EPSG:4326', newCoords);

			} else {
				const newCoords = proj4('EPSG:4326', 'EPSG:3857', coords);
				return EPSG2PIXEL(newCoords);
			}
		}
	};
}
