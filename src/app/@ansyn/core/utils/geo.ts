import { feature, point } from '@turf/helpers';
import * as centerOfMass from '@turf/center-of-mass';
import * as circle from '@turf/circle';
import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';
import * as helpers from '@turf/helpers'
import * as turf from '@turf/turf';

export function getPolygonByPoint(lonLat: number[]): GeoJSON.Feature<GeoJSON.Polygon> {
	return bboxPolygon(bbox(point(lonLat)));
}

export function getPolygonByPointAndRadius(lonLat: number[], radius = 0.001): GeoJSON.Feature<GeoJSON.Polygon> {
	const tPoint = point(lonLat);
	return bboxPolygon(bbox(circle(tPoint, radius)));
}

export function getPointByGeometry(geometry: GeoJSON.GeometryObject | GeoJSON.FeatureCollection<any>): GeoJSON.Point {
	if (geometry.type === 'FeatureCollection') {
		return <GeoJSON.Point>centerOfMass(<any>geometry).geometry;
	}
	else {
		return <GeoJSON.Point>centerOfMass(feature(<GeoJSON.GeometryObject>geometry)).geometry;
	}
}

export function bboxFromGeoJson(polygon: GeoJSON.Polygon): number[] {
	let line = helpers.lineString(polygon.coordinates[0]);
	let bboxFromPolygon = bbox(line);
	return bboxFromPolygon;
}

export function geojsonMultiPolygonToPolygon(multiPolygon: GeoJSON.MultiPolygon): GeoJSON.Polygon {
	return  <GeoJSON.Polygon> turf.geometry('Polygon', multiPolygon.coordinates[0]);
}

export function geojsonPolygonToMultiPolygon(polygon: GeoJSON.Polygon): GeoJSON.MultiPolygon {
	return <GeoJSON.MultiPolygon> turf.geometry('MultiPolygon', [polygon.coordinates])
}
