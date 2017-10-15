import { FeatureCollection, GeometryObject, Point } from 'geojson';
import { feature, point } from '@turf/helpers';
import * as centerOfMass from '@turf/center-of-mass';
import * as circle from '@turf/circle';
import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';

export function getPolygonByPoint(lonLat: number[]): GeoJSON.Feature<GeoJSON.Polygon> {
	return bboxPolygon(bbox(point(lonLat)));
}

export function getPolygonByPointAndRadius(lonLat: number[], radius = 0.001): GeoJSON.Feature<GeoJSON.Polygon> {
	const tPoint = point(lonLat);
	return bboxPolygon(bbox(circle(tPoint, radius)));
}

export function getPointByPolygon(geometry: GeometryObject | FeatureCollection<any>): Point {
	if (geometry.type === 'FeatureCollection') {
		return <Point>centerOfMass(<FeatureCollection<any>>geometry).geometry;
	}
	else {
		return <Point>centerOfMass(feature(<GeometryObject>geometry)).geometry;
	}
}
