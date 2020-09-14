import {
	Feature,
	FeatureCollection,
	GeometryObject,
	LineString,
	MultiPolygon,
	Point,
	Polygon,
	Position
} from 'geojson';
import {
	AllGeoJSON,
	area,
	bbox,
	bboxPolygon,
	booleanEqual,
	booleanPointInPolygon,
	booleanPointOnLine,
	centerOfMass,
	circle,
	destination,
	feature,
	geometry,
	intersect,
	lineIntersect,
	point,
	polygon,
	union,
	unkinkPolygon,
	featureCollection,
	envelope,
	distance
} from '@turf/turf';

export type BBOX = [number, number, number, number] | [number, number, number, number, number, number];

export function getPolygonByPoint(lonLat: number[]): Feature<Polygon> {
	return bboxPolygon(bbox(point(lonLat)));
}

export function getPolygonByPointAndRadius(lonLat: number[], radius = 0.001): Feature<Polygon> {
	const tPoint = point(lonLat);
	return bboxPolygon(bbox(circle(tPoint, radius)));
}

export function getPolygonByBufferRadius(polygonSource: Polygon, radiusInMeteres: number): Feature<Polygon> {
	if (radiusInMeteres <= 0) {
		return polygon(polygonSource.coordinates);
	}
	const bbox = bboxFromGeoJson(polygonSource);
	const bboxedPolygon = polygonFromBBOX(bbox);
	const possiblePointsInRadius = featureCollection([]);

	bboxedPolygon.coordinates[0].forEach((coordinate) => {
		const pointByCoordinate = point(coordinate);
		const bearings = [0, 90, 180, 270];
		bearings.forEach((bearing: number) => {
			let destinationPoint = destination(pointByCoordinate, radiusInMeteres, bearing, { units: 'meters' });
			possiblePointsInRadius.features.push(destinationPoint);
		});
	});
	const result: Feature<Polygon> = envelope(possiblePointsInRadius);
	return result;
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

export function getPolygonIntersectionRatio(extent: Polygon, footprint: MultiPolygon | Point | LineString): number {
	let intersection = 0;
	switch (footprint.type) {
		case 'MultiPolygon':
			intersection = getPolygonIntersectionRatioWithMultiPolygon(extent, footprint);
			break;
		case 'LineString':
			const intersectPoints = lineIntersect(footprint, <any>extent);
			intersection = intersectPoints.features.length / footprint.coordinates.length;
			break;
		case 'Point':
			intersection = +booleanPointInPolygon(footprint, extent);
			break
	}
	return intersection
}

export function polygonsDontIntersect(extentPolygon, footprint, overlayCoverage): boolean {
	const intersection = getPolygonIntersectionRatio(extentPolygon, footprint);
	return intersection < overlayCoverage;
}

export function getPolygonIntersectionRatioWithMultiPolygon(extent: Polygon, footprint: MultiPolygon): number {
	let intersectionArea = 0;
	let extentArea = 1;
	try {
		const extentPolygon = polygon(extent.coordinates);
		const extentPolygons = unkinkPolygon(extentPolygon);
		extentArea = area(extentPolygons);

		footprint.coordinates.forEach(coordinates => {
			const tempPoly = polygon(coordinates);
			const intersections = extentPolygons.features.map( feature => intersect(feature.geometry, tempPoly));
			intersectionArea = intersections.reduce( (acc, intersection) => {
				if (intersection) {
					acc = booleanEqual(intersection, tempPoly) ? extentArea : acc + area(intersection);
				}
				return acc;
			}, 0)
		});
	} catch (e) {
		console.warn('getPolygonIntersectionRatioWithMultiPolygon: turf exception', e);
	}

	return intersectionArea / extentArea > 0.99 ? 1 : intersectionArea / extentArea;
}

export function isPointContainedInGeometry(point: Point, footprint: MultiPolygon | Point | LineString): boolean {
	if (!Boolean(footprint) || !Boolean(point)) {
		console.error('isPointContainedInMultiPolygon invalid params');
		return false;
	}
	switch (footprint.type) {
		case 'Point':
			return booleanEqual(point, footprint);
		case 'LineString':
			return booleanPointOnLine(point, footprint);
		case 'MultiPolygon':
			for (let i = 0; i < footprint.coordinates.length; i++) {
				const contained = booleanPointInPolygon(point, polygon(footprint.coordinates[i]));
				if (contained) {
					return true;
				}
			}
			break;
	}
	return false;
}

export function unifyPolygons(features: Feature<Polygon>[]): Feature<MultiPolygon | Polygon> {
	return union(...features);
}

export function calculateLineDistance(aPoint: Point, bPoint: Point) {
	return distance(aPoint, bPoint);
}

export function calculateGeometryArea(polygon: Polygon) {
	return area(polygon);
}

export function getDistanceBetweenPoints(source: Point, destination: Point): number {
	let distanceInKilometers = 0;
	try {
		distanceInKilometers = distance(source, destination, { units: 'kilometers' });
	} catch (e) {
		console.warn('getDistanceBetweenPoints: turf exception', e);
	}
	return distanceInKilometers;
}

export function getNewPoint(coordinates: Position): Point {
	return {
		type: 'Point',
		coordinates
	};
}

export const EPSG_4326 = 'EPSG:4326';
export const EPSG_3857 = 'EPSG:3857';
