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

export function heatmapCalculate(value, min, max) {
	let colorP = (value - min) / (max - min ) || 1;
	const colors = [[0, 255, 0], [255, 255, 0], [255, 0, 0]];
	const idx = Math.ceil(colorP * (colors.length - 1));
	const color = colors[idx]
	return `rgba(${color.join(',')}, 0.5)`
}
