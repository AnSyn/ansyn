import * as GeoJSON from 'geojson';
import * as bbox from '@turf/bbox';
import * as center from '@turf/center';
import * as inside from '@turf/inside';
import { polygon } from '@turf/helpers';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';
import { CaseMapExtent } from '../models/case-map-position.model';

export function extentFromGeojson(footprint: GeoJSON.MultiPolygon | GeoJSON.Polygon): CaseMapExtent {
	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	return <any>bbox(<any>footprintFeature);
}

export function extentToPolygon(extent: CaseMapExtent) {
	const coordinates = [];

	// Keep this order otherwise self intersection!
	coordinates.push([extent[0], extent[1]]);
	coordinates.push([extent[0], extent[3]]);
	coordinates.push([extent[2], extent[3]]);
	coordinates.push([extent[2], extent[1]]);
	coordinates.push([extent[0], extent[1]]);

	return polygon([coordinates]);
}

export function isExtentContainedInPolygon(extent: CaseMapExtent, footprint: GeoJSON.MultiPolygon): boolean {
	const extentPoly = extentToPolygon(extent);

	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const centerPoint = center(extentPoly);
	return inside(centerPoint, <any>footprintFeature);
}

export function getFootprintIntersectionRatioInExtent(extent: CaseMapExtent, footprint: GeoJSON.MultiPolygon): number {
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
