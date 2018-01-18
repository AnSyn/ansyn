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

export function getPointByGeometry(geometry: GeoJSON.GeometryObject | GeoJSON.FeatureCollection<any>): GeoJSON.Point {
	if (geometry.type === 'FeatureCollection') {
		return <GeoJSON.Point>centerOfMass(<any>geometry).geometry;
	}
	else {
		return <GeoJSON.Point>centerOfMass(feature(<GeoJSON.GeometryObject>geometry)).geometry;
	}
}

export function geojsonMultiPolygonToPolygon(multiPolygon: GeoJSON.MultiPolygon): GeoJSON.Polygon {
	if (!multiPolygon) {
		return null;
	}

	return {
		type: 'Polygon',
		coordinates: multiPolygon.coordinates[0]
	};
}

export function geojsonPolygonToMultiPolygon(polygon: GeoJSON.Polygon): GeoJSON.MultiPolygon {
	if (!polygon) {
		return null;
	}
	const coordinates = [];
	coordinates.push(polygon.coordinates);

	return {
		type: 'MultiPolygon',
		coordinates: coordinates
	};
}
