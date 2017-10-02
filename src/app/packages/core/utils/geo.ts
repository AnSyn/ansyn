import { FeatureCollection, GeometryObject, Point } from 'geojson';
import { feature, point } from '@turf/helpers';
import * as centerOfMass from '@turf/center-of-mass';
import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';

export function getPolygonByPoint(lonLat: number[]): GeoJSON.Feature<GeoJSON.Polygon> {
	return bboxPolygon(bbox(point(lonLat)));
}

export function getPointByPolygon(geometry: GeometryObject | FeatureCollection<any>): Point {
	if (geometry.type === 'FeatureCollection') {
		return <Point>centerOfMass(<FeatureCollection<any>>geometry).geometry;
	}
	else {
		return <Point>centerOfMass(feature(<GeometryObject>geometry)).geometry;
	}
}
