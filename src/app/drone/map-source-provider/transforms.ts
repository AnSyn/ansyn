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

export function createTransformMatrix(boundary: Array<Array<number>>, width: number, height: number) {
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

//
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

export function createTransformForCesium(boundary: Array<Array<number>>, width: number, height: number): string {
	const A = createTransformMatrix(boundary, width, height);

	const arrayA = [...A[0], ...A[1], ...A[2]];
	let inverseA = Cesium.Matrix3.inverse(arrayA, new Cesium.Matrix3());
	inverseA = [[inverseA[0], inverseA[1], inverseA[2]], [inverseA[3], inverseA[4], inverseA[5]], [inverseA[6], inverseA[7], inverseA[8]]];

	const projectionText = '\n' +
		'function createProjectionFunctions(callback) {\n' +
		'	function convertPixels(matrix, pixels) {\n' +
		'		var r = math.inv(matrix);\n' +
		'		return dlt.transform2d(r, pixels);\n' +
		'	}\n' +
		'	function dltTransform2d(matrix, pixels) {\n' +
		'		var r = math.inv(matrix);\n' +
		'		return dlt.transform2d(r, pixels);\n' +
		'	}\n' +
		'\n' +
		'	function convertCoordinates(matrix, coords) {\n' +
		'		return dlt.transform2d(matrix, coords);\n' +
		'	}\n' +
		'\n' +
		'	var transformMatrix =' + JSON.stringify(A) + ';\n' +
		'	var PIXEL2EPSG = (coords) => {\n' +
		'		return convertPixels(transformMatrix, coords);\n' +
		'	};\n' +
		'\n' +
		'	var EPSG2PIXEL = (coords) => {\n' +
		'		return convertCoordinates(transformMatrix, coords);\n' +
		'	};\n' +
		'\n' +
		'	var DEGREES_PER_RADIAN =' + Cesium.Math.DEGREES_PER_RADIAN + ';\n' +
		'	var RADIANS_PER_DEGREE =' + Cesium.Math.RADIANS_PER_DEGREE + ';\n' +
		'	function project(cartographic, result) {\n' +
		'		var longitudeDegrees = DEGREES_PER_RADIAN * cartographic.longitude;\n' +
		'		var latitudeDegrees = DEGREES_PER_RADIAN * cartographic.latitude;\n' +
		'		var res = EPSG2PIXEL([longitudeDegrees, latitudeDegrees]);\n' +
		'		result.x = res[0];\n' +
		'		result.y = res[1];\n' +
		'		result.z = cartographic.height;\n' +
		'	}\n' +
		'\n' +
		'	function unproject(cartesian, result) {\n' +
		'		var newCoords = PIXEL2EPSG([cartesian.x, cartesian.y]);\n' +
		'		result.longitude = newCoords[0] * RADIANS_PER_DEGREE;\n' +
		'		result.latitude = newCoords[1] * RADIANS_PER_DEGREE;\n' +
		'		result.height = cartesian.z;\n' +
		'	}\n' +
		'	callback(project, unproject);\n' +
		'};\n';
	const projectionTextUrl = 'data:text/javascript;base64,' + window.btoa(projectionText);
	return projectionTextUrl;
}

// const projectionText =
// 	'function createProjectionFunctions(callback) {\n' +
// 	'     var DEGREES_PER_RADIAN = ' + Cesium.Math.DEGREES_PER_RADIAN + ';\n' +
// 	'     var RADIANS_PER_DEGREE = ' + Cesium.Math.RADIANS_PER_DEGREE + ';\n' +
// 	'     var toGeographic = ' + JSON.stringify(Cesium.Matrix4.pack(approximateTransform, [])) + ';\n' +
// 	'     var toLocal = ' + JSON.stringify(Cesium.Matrix4.pack(approximateTransformInverse, [])) + ';\n' +
// 	'     function matrixMultiply(matrix, x, y) {\n' +
// 	'          var xr = matrix[0] * x + matrix[4] * y + matrix[12];\n' +
// 	'          var yr = matrix[1] * x + matrix[5] * y + matrix[13];\n' +
// 	'          var wr = matrix[3] * x + matrix[7] * y + matrix[15];\n' +
// 	'          return [xr / wr, yr / wr];\n' +
// 	'     }\n' +
// 	'     function project(cartographic, result) {\n' +
// 	'          var longitudeDegrees = DEGREES_PER_RADIAN * cartographic.longitude;\n' +
// 	'          var latitudeDegrees = DEGREES_PER_RADIAN * cartographic.latitude;\n' +
// 	'          var arr = matrixMultiply(toLocal, longitudeDegrees, latitudeDegrees);\n' +
// 	'          result.x = arr[0];\n' +
// 	'          result.y = arr[1];\n' +
// 	'          result.z = cartographic.height;\n' +
// 	'     }\n' +
// 	'     function unproject(cartesian, result) {\n' +
// 	'          var arr = matrixMultiply(toGeographic, cartesian.x, cartesian.y);\n' +
// 	'          result.longitude = arr[0] * RADIANS_PER_DEGREE;\n' +
// 	'          result.latitude = arr[1] * RADIANS_PER_DEGREE;\n' +
// 	'          result.height = cartesian.z;\n' +
// 	'     }\n' +
// 	'     callback(project, unproject);\n' +
// 	' }\n';
// const projectionTextUrl = 'data:text/javascript;base64,' + window.btoa(projectionText);
