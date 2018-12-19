import proj4 from 'proj4';
import { mat3 } from 'gl-matrix';

interface ITransformer {
	EPSG3857: any;
	EPSG4326: any;
}

function convertPixels(mapCoordinates, x, y) {
	const m = mat3.fromValues(...mapCoordinates);
	const lon = (m[0] * x) + (m[1] * y) + m[2];
	const lat = (m[3] * x) + (m[4] * y) + m[5];
	const result = [lon, lat];
	return result;

}

function convertCoordinates(mapCoordinates, lon, lat) {
	const matrix = mat3.fromValues(...mapCoordinates);
	const m = mat3.invert(mat3.create(), matrix);
	const x = (m[0] * lon) + (m[1] * lat) + m[2];
	const y = (m[3] * lon) + (m[4] * lat) + m[5];
	const result = [x, y];

	return result;
}

function createMapMatrix(boundary: Array<Array<number>>) {
	const topLeft = proj4('EPSG:4326', 'EPSG:3857', boundary[0]);
	const  topRight = proj4('EPSG:4326', 'EPSG:3857', boundary[1]);
	const bottomRight = proj4('EPSG:4326', 'EPSG:3857', boundary[2]);
	const  bottomLeft = proj4('EPSG:4326', 'EPSG:3857', boundary[3]);

	const x1 = topLeft[0];
	const x2 = topRight[0];
	const x3 = bottomLeft[0];

	const y1 = topLeft[1];
	const y2 = topRight[1];
	const y3 = bottomLeft[1];

	const mapMatrix = [
		x2 - x1, x3 - x1, x1,
		y2 - y1, y3 - y1, y1,
		0, 0, 1
	];

	return mapMatrix;
}

export const FROMPIXEL = 'fromPixel';
export const FROMCOORDINATES = 'fromCoordinates';

export function createTransform(code: string, boundary: Array<Array<number>>, width: number, height: number): ITransformer {
	const mapMatrix = createMapMatrix(boundary);
	const PIXEL2EPSG = (coords) => {
		const valX = coords[0] / width;
		const valY = (height - coords[1]) / height;
		const result = convertPixels(mapMatrix, valX, valY);
		return [result[0], result[1]];
	};
	const EPSG2PIXEL = (coords) => {
		const result = convertCoordinates(mapMatrix, coords[0], coords[1]);
		const resultX = result[0] * width;
		const resultY = result[1] * height;
		return [resultX, height - resultY];
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
