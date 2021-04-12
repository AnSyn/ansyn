// Converts from degrees to radians.
import { Point } from 'geojson';
import { bearing } from '@turf/turf';

export function toRadians(degrees: number): number {
	return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
export function toDegrees(radians: number): number {
	return radians * 180 / Math.PI;
}

export function getAngleDegreeBetweenPoints(source: Point, destination: Point): number {
	const brng = bearing(source, destination);
	return brng;
}

export function randomColor() {
	return `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`
}
