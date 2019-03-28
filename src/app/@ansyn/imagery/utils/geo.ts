import { Feature, FeatureCollection, GeometryObject, MultiPolygon, Point, Polygon } from 'geojson';
import { bbox, bboxPolygon, centerOfMass, circle, feature, geometry, lineString, point } from '@turf/turf';

export function getPolygonByPoint(lonLat: number[]): Feature<Polygon> {
	return bboxPolygon(bbox(point(lonLat)));
}

export function getPolygonByPointAndRadius(lonLat: number[], radius = 0.001): Feature<Polygon> {
	const tPoint = point(lonLat);
	return bboxPolygon(bbox(circle(tPoint, radius)));
}

export function getPointByGeometry(geometry: GeometryObject | FeatureCollection<any>): Point {
	if (geometry.type === 'FeatureCollection') {
		return <Point>centerOfMass(<any>geometry).geometry;
	}
	else {
		return <Point>centerOfMass(feature(<any>geometry)).geometry;
	}
}

export function bboxFromGeoJson(polygon: Polygon): number[] {
	let line = lineString(polygon.coordinates[0]);
	let bboxFromPolygon = bbox(line);
	return bboxFromPolygon;
}

export function geojsonMultiPolygonToPolygon(multiPolygon: MultiPolygon): Polygon {
	return <Polygon> geometry('Polygon', multiPolygon.coordinates[0]);
}

export function geojsonPolygonToMultiPolygon(polygon: Polygon): MultiPolygon {
	return <MultiPolygon> geometry('MultiPolygon', [polygon.coordinates]);
}

export function areCoordinatesNumeric(coord) {
	return coord && !isNaN(coord[0]) && !isNaN(coord[1]) && (Math.abs(coord[0]) !== 999999) && (Math.abs(coord[1]) !== 999999);
}
