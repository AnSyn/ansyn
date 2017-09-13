import { FeatureCollection, GeometryObject, Point } from 'geojson';
import { feature, point } from '@turf/helpers';
import * as centerOfMass from '@turf/center-of-mass';
import * as circle from '@turf/circle';

export function getPolygonByPoint(lonLat: number[], radius = 0.1): GeoJSON.Feature<GeoJSON.Polygon> {
	const tPoint = point(lonLat);
	const region = circle(tPoint, radius);
	return region;
}

export function getPointByPolygon(geometry: GeometryObject | FeatureCollection<any>): Point {
	if (geometry.type === 'FeatureCollection') {
		return <Point>centerOfMass(<FeatureCollection<any>>geometry).geometry;
	}
	else {
		return <Point>centerOfMass(feature(<GeometryObject>geometry)).geometry;
	}
}
