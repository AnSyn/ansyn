import { MultiPolygon, Polygon as geoPolygon } from 'geojson';
import { area, intersect, polygon, unkinkPolygon } from '@turf/turf';

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
