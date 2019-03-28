import { Feature, MultiPolygon, Polygon as geoPolygon } from 'geojson';
import { area, bbox, feature, intersect, polygon, unkinkPolygon } from '@turf/turf';
import { CaseMapExtent } from '../../../../imagery/model/case-map-position.model';

export function extentFromGeojson(footprint: MultiPolygon | geoPolygon): CaseMapExtent {
	const footprintFeature: Feature<any> = feature(footprint);
	return <any>bbox(<any>footprintFeature);
}

export function getFootprintIntersectionRatioInExtent(extent: geoPolygon, footprint: MultiPolygon): number {
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
		console.warn('getFootprintIntersectionRatioInExtent: turf exception', e);
	}

	return intersectionArea / extentArea;
}
