import { Feature, FeatureCollection, GeometryObject, MultiPolygon, Point, Polygon, BBox } from 'geojson';
import { bbox, bboxPolygon, centerOfMass, circle, feature, geometry, point, AllGeoJSON } from '@turf/turf';

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
	} else {
		return <Point>centerOfMass(feature(<any>geometry)).geometry;
	}
}

export function bboxFromGeoJson(geoJson: AllGeoJSON): number[] {
	let bboxFromPolygon = bbox(geoJson);
	return bboxFromPolygon;
}

export function polygonFromBBOX(bbox: number[]): Polygon {
	const bboxedPolygon: Feature<Polygon> = bboxPolygon(<BBox>bbox);
	return bboxedPolygon.geometry;
}

export function geojsonMultiPolygonToBBOXPolygon(multiPolygon: MultiPolygon): Polygon {
	const bbox = bboxFromGeoJson(multiPolygon);
	const bboxedPolygon = polygonFromBBOX(bbox)
	return bboxedPolygon;
}

export function geojsonMultiPolygonToFirstPolygon(multiPolygon: MultiPolygon): Polygon {
	return <Polygon>geometry('Polygon', multiPolygon.coordinates[0]);
}

export function geojsonMultiPolygonToPolygons(multiPolygon: MultiPolygon): Polygon[] {
	const polygons = multiPolygon.coordinates.map((polygonCoordinates) => {
		return <Polygon>geometry('Polygon', polygonCoordinates);
	});
	return polygons;
}

export function geojsonPolygonToMultiPolygon(polygon: Polygon): MultiPolygon {
	return <MultiPolygon>geometry('MultiPolygon', [polygon.coordinates]);
}

export function areCoordinatesNumeric(coord) {
	return coord && !isNaN(coord[0]) && !isNaN(coord[1]) && (Math.abs(coord[0]) !== 999999) && (Math.abs(coord[1]) !== 999999);
}
