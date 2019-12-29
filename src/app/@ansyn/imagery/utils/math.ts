// Converts from degrees to radians.
import { Point } from 'geojson';

export function toRadians(degrees: number): number {
	return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
export function toDegrees(radians: number): number {
	return radians * 180 / Math.PI;
}

export function getAngleDegreeBetweenPoints(source: Point, destination: Point): number {
	const destinationRad: [number, number] = [toRadians(destination.coordinates[0]), toRadians(destination.coordinates[1])];
	const sourceRad: [number, number] = [toRadians(source.coordinates[0]), toRadians(source.coordinates[1])];

	const longDelta = sourceRad[0] - destinationRad[0];
	const y = Math.sin(longDelta) * Math.cos(sourceRad[1]);
	const x = Math.cos(destinationRad[1]) * Math.sin(sourceRad[1]) - Math.sin(destinationRad[1]) * Math.cos(sourceRad[1]) * Math.cos(longDelta);
	const brng = 360 - (toDegrees(Math.atan2(y, x)));
	return brng;
}
