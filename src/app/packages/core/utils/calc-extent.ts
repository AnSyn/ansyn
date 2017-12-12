import * as GeoJSON from 'geojson';
import * as bbox from '@turf/bbox';
import * as center from '@turf/center';
import * as inside from '@turf/inside';
import { polygon } from '@turf/helpers';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';

export function calcGeoJSONExtent(footprint: GeoJSON.MultiPolygon): [number, number, number, number] {
	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	return bbox(footprintFeature);
}

export function extentToPolygon(extent: [number, number, number, number]) {
	const coordinates = [];

	// Keep this order otherwise self intersection!
	coordinates.push([extent[0], extent[1]]);
	coordinates.push([extent[0], extent[3]]);
	coordinates.push([extent[2], extent[3]]);
	coordinates.push([extent[2], extent[1]]);
	coordinates.push([extent[0], extent[1]]);

	return polygon([coordinates]);
}

export function isExtentContainedInPolygon(extent: [number, number, number, number], footprint: GeoJSON.MultiPolygon): boolean {
	const extentPoly = extentToPolygon(extent);

	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const centerPoint = center(extentPoly);
	return inside(centerPoint, footprintFeature);
}

export function getFootprintIntersectionRatioInExtent(extent: [number, number, number, number], footprint: GeoJSON.MultiPolygon): number {
	const extentPolygon = extentToPolygon(extent);

	const extentArea = area(extentPolygon);

	let intersectionArea = 0;
	footprint.coordinates.forEach(coordinates => {
		const intersection = intersect(extentPolygon, polygon(coordinates));
		if (intersection) {
			intersectionArea += area(intersection);
		}
	});

	return intersectionArea / extentArea;
}
