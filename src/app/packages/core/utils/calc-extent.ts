import * as turf from '@turf/turf';

export function calcGeoJSONExtent(footprint: GeoJSON.MultiPolygon): GeoJSON.Point[] {
	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const bbox = turf.bbox(footprintFeature);
	const bboxPolygon = turf.bboxPolygon(bbox);
	let boundingBox: GeoJSON.Point[] = [];
	bboxPolygon.geometry.coordinates[0].forEach((p)=> {
		const coord: GeoJSON.Point = {
			coordinates: [p[0], p[1], p.length > 2 ? p[2] : 0],
			type: 'Point'
		};
		boundingBox.push(coord);
	});
	return boundingBox;
}

export function isExtentContainedInPolygon(extent: GeoJSON.Point[], footprint: GeoJSON.MultiPolygon): boolean {

	const coordinates = [];
	extent.forEach((p: GeoJSON.Point)=> {
		coordinates.push(p.coordinates);
	});

	coordinates.push(extent[0].coordinates);

	const extentPoly = turf.polygon([coordinates]);

	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const centerPoint = turf.center(extentPoly);
	const isInside = turf.inside(centerPoint, footprintFeature);
	return isInside;
}
