import * as turf from '@turf/turf';

export function calcGeoJSONExtent(footprint) {
	const footprintFeature: GeoJSON.Feature<any> = {
		"type": 'Feature',
		"properties": {},
		"geometry": footprint
	};
	const center = turf.center(footprintFeature);
	const bbox = turf.bbox(footprintFeature);
	const bboxPolygon = turf.bboxPolygon(bbox);
	const extent = {topLeft: bboxPolygon.geometry.coordinates[0][0], topRight: bboxPolygon.geometry.coordinates[0][1], bottomLeft: bboxPolygon.geometry.coordinates[0][2], bottomRight:bboxPolygon.geometry.coordinates[0][3]};
	return extent;
}
