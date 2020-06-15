// Converts from degrees to radians.
import { Point as GeoPoint, Point } from 'geojson';
import { bearing, geometry } from '@turf/turf';

export function toRadians(degrees: number): number {
	return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
export function toDegrees(radians: number): number {
	return radians * 180 / Math.PI;
}

export function getAngleDegreeBetweenCoordinates(source: [], destination: []): number {
	const sourcePoint = <GeoPoint>geometry('Point', source);
	const destinationPoint = <GeoPoint>geometry('Point', destination);
	const brng = bearing(sourcePoint, destinationPoint);
	return brng;
}

export function getAngleDegreeBetweenPoints(source: Point, destination: Point): number {
	const brng = bearing(source, destination);
	return brng;
}
