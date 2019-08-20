import {
	Feature,
	FeatureCollection,
	GeometryObject,
	MultiPolygon,
	Point,
	Polygon as geoPolygon,
	Polygon
} from 'geojson';
import {
	bbox,
	bboxPolygon,
	centerOfMass,
	circle,
	feature,
	geometry,
	point,
	AllGeoJSON,
	unkinkPolygon, area, intersect, polygon, booleanContains
} from '@turf/turf';

export type BBOX = [number, number, number, number] | [number, number, number, number, number, number];
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

export function bboxFromGeoJson(geoJson: AllGeoJSON): BBOX {
	let bboxFromPolygon = bbox(geoJson);
	return bboxFromPolygon;
}

export function polygonFromBBOX(bbox: BBOX): Polygon {
	const bboxedPolygon: Feature<Polygon> = bboxPolygon(bbox);
	return bboxedPolygon.geometry;
}

export function geojsonMultiPolygonToBBOXPolygon(multiPolygon: MultiPolygon): Polygon {
	const bbox = bboxFromGeoJson(multiPolygon);
	const bboxedPolygon = polygonFromBBOX(bbox);
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

export function getPolygonIntersectionRatioWithMultiPolygon(extent: geoPolygon, footprint: MultiPolygon): number {
	let intersectionArea = 0;
	let extentArea = 1;
	try {
		const extentPolygon = polygon(extent.coordinates);
		const extentPolygons = unkinkPolygon(extentPolygon);
		extentArea = area(extentPolygons);

		footprint.coordinates.forEach(coordinates => {
			const intersection = intersect(extentPolygon, polygon(coordinates));
			if (intersection) {
				intersectionArea += area(intersection);
			}
		});
	} catch (e) {
		console.warn('getPolygonIntersectionRatioWithMultiPolygon: turf exception', e);
	}

	return intersectionArea / extentArea > 0.99 ? 1 : intersectionArea / extentArea;
}

export function isPointContainedInMultiPolygon(point: Point, footprint: MultiPolygon): boolean {
	if (!Boolean(footprint) || !Boolean(point)) {
		console.error('isPointContainedInMultiPolygon invalid params');
		return false;
	}

	try {
		for (let i = 0; i < footprint.coordinates.length; i++) {
			const contained = booleanContains(polygon(footprint.coordinates[i]), point);
			if (contained) {
				return true;
			}
		}
	} catch (e) {
		console.warn('isPointContainedInMultiPolygon: turf exception ', e);
	}
	return false;
}
