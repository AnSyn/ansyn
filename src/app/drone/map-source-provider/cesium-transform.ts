import * as math from 'mathjs';

export function calculateApproximateTransform(boundary: Array<Array<number>>, width: number, height: number) {
	const topLeft = boundary[3];
	const topRight = boundary[2];
	const bottomRight = boundary[1];
	const bottomLeft = boundary[0];


	const controlPoint1 = {
		'SourcePoint': {'X': 0, 'Y': 0, 'Z': 0},
		'TargetPoint': {
			'X': topLeft[0],
			'Y': topLeft[1],
			'Z': 0
		}
	};

	const controlPoint2 = {
		'SourcePoint': {'X': 0, 'Y': height, 'Z': 0},
		'TargetPoint': {
			'X': bottomLeft[0],
			'Y': bottomLeft[1],
			'Z': 0
		}
	};

	const controlPoint3 = {
		'SourcePoint': {'X': width, 'Y': height, 'Z': 0},
		'TargetPoint': {
			'X': bottomRight[0],
			'Y': bottomRight[1],
			'Z': 0
		}
	};

	const controlPoint4 = {
		'SourcePoint': {'X': width, 'Y': 0, 'Z': 0},
		'TargetPoint': {
			'X': topRight[0],
			'Y': topRight[1],
			'Z': 0
		}
	};

	let res;
	try {
		res = getApproximateTransformMatrix(controlPoint1, controlPoint2, controlPoint3, controlPoint4);
	} catch (e) {
		console.log(e);
	}
	return res;
}

function getApproximateTransformMatrix(controlPoint1: { TargetPoint: { X: number; Y: number; Z: number }; SourcePoint: { X: number; Y: number; Z: number } }, controlPoint2: { TargetPoint: { X: number; Y: number; Z: number }; SourcePoint: { X: number; Y: number; Z: number } }, controlPoint3: { TargetPoint: { X: number; Y: number; Z: number }; SourcePoint: { X: number; Y: number; Z: number } }, controlPoint4: { TargetPoint: { X: number; Y: number; Z: number }; SourcePoint: { X: number; Y: number; Z: number } }) {
	const sourceMatrix = [
		[controlPoint1.SourcePoint.X, controlPoint1.SourcePoint.Y, 1, 0, 0, 0, -controlPoint1.TargetPoint.X * controlPoint1.SourcePoint.X, -controlPoint1.TargetPoint.X * controlPoint1.SourcePoint.Y],
		[0, 0, 0, controlPoint1.SourcePoint.X, controlPoint1.SourcePoint.Y, 1, -controlPoint1.TargetPoint.Y * controlPoint1.SourcePoint.X, -controlPoint1.TargetPoint.Y * controlPoint1.SourcePoint.Y],
		[controlPoint2.SourcePoint.X, controlPoint2.SourcePoint.Y, 1, 0, 0, 0, -controlPoint2.TargetPoint.X * controlPoint2.SourcePoint.X, -controlPoint2.TargetPoint.X * controlPoint2.SourcePoint.Y],
		[0, 0, 0, controlPoint2.SourcePoint.X, controlPoint2.SourcePoint.Y, 1, -controlPoint2.TargetPoint.Y * controlPoint2.SourcePoint.X, -controlPoint2.TargetPoint.Y * controlPoint2.SourcePoint.Y],
		[controlPoint3.SourcePoint.X, controlPoint3.SourcePoint.Y, 1, 0, 0, 0, -controlPoint3.TargetPoint.X * controlPoint3.SourcePoint.X, -controlPoint3.TargetPoint.X * controlPoint3.SourcePoint.Y],
		[0, 0, 0, controlPoint3.SourcePoint.X, controlPoint3.SourcePoint.Y, 1, -controlPoint3.TargetPoint.Y * controlPoint3.SourcePoint.X, -controlPoint3.TargetPoint.Y * controlPoint3.SourcePoint.Y],
		[controlPoint4.SourcePoint.X, controlPoint4.SourcePoint.Y, 1, 0, 0, 0, -controlPoint4.TargetPoint.X * controlPoint4.SourcePoint.X, -controlPoint4.TargetPoint.X * controlPoint4.SourcePoint.Y],
		[0, 0, 0, controlPoint4.SourcePoint.X, controlPoint4.SourcePoint.Y, 1, -controlPoint4.TargetPoint.Y * controlPoint4.SourcePoint.X, -controlPoint4.TargetPoint.Y * controlPoint4.SourcePoint.Y]
	];
	const targetVector = [
		controlPoint1.TargetPoint.X, controlPoint1.TargetPoint.Y,
		controlPoint2.TargetPoint.X, controlPoint2.TargetPoint.Y,
		controlPoint3.TargetPoint.X, controlPoint3.TargetPoint.Y,
		controlPoint4.TargetPoint.X, controlPoint4.TargetPoint.Y
	];

	const f = math.lup(sourceMatrix);
	const resultVector = math.lusolve(f, targetVector);

	return [
		resultVector.get([0, 0]),
		resultVector.get([3, 0]),
		0,
		resultVector.get([6, 0]),
		resultVector.get([1, 0]),
		resultVector.get([4, 0]),
		0,
		resultVector.get([7, 0]),
		0, 0, 1, 0,
		resultVector.get([2, 0]),
		resultVector.get([5, 0]),
		0, 1
	];
}
