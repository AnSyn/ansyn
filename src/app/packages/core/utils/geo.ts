import { FeatureCollection, GeometryObject, Point, Polygon } from 'geojson';
import * as turf from '@turf/turf';

export function getPolygonByPoint(lonLat: number[], radius=0.1) : GeoJSON.Feature<GeoJSON.Polygon>{
	const point = turf.point(lonLat);
	const region = turf.circle(point,radius);
	return region;
}

export function getPointByPolygon(geometry: GeometryObject | FeatureCollection<any>): Point {
	if(geometry.type === 'FeatureCollection'){
		return <Point>turf.centerOfMass(<FeatureCollection<any>>geometry).geometry;
	}
	else {
		return <Point>turf.centerOfMass(turf.feature(<GeometryObject>geometry)).geometry;
	}
}
