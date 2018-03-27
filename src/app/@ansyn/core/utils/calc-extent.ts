import { Feature, MultiPolygon, Polygon as geoPolygon } from 'geojson';
import * as bbox from '@turf/bbox';
import { polygon } from '@turf/helpers';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';
import { CaseMapExtent } from '../models/case-map-position.model';

export function extentFromGeojson(footprint: MultiPolygon | geoPolygon): CaseMapExtent {
	const footprintFeature: Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	return <any>bbox(<any>footprintFeature);
}

export function getFootprintIntersectionRatioInExtent(extent: geoPolygon, footprint: MultiPolygon): number {
	const extentPolygon = polygon(extent.coordinates);
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
