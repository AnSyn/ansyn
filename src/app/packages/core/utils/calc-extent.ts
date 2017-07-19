import * as  bbox from '@turf/bbox';
import * as  bboxPolygon from '@turf/bbox-polygon';
import * as center from '@turf/center';
import * as inside from '@turf/inside';
import { polygon } from '@turf/helpers';

export function calcGeoJSONExtent(footprint: GeoJSON.MultiPolygon): GeoJSON.Point[] {
	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const bboxResult = bbox(footprintFeature);
	const bboxPolygonResult = bboxPolygon(bboxResult);
	let boundingBox: GeoJSON.Point[] = [];
	bboxPolygonResult.geometry.coordinates[0].forEach((p)=> {
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
	if (extent.length === 2) {
		coordinates.push(extent[0].coordinates);
		coordinates.push([extent[0].coordinates[0], extent[1].coordinates[1]]);
		coordinates.push([extent[1].coordinates[0], extent[0].coordinates[1]]);
		coordinates.push(extent[1].coordinates);
	} else {
		extent.forEach((p: GeoJSON.Point)=> {
			coordinates.push(p.coordinates);
		});
	}

	coordinates.push(extent[0].coordinates);

	const extentPoly = polygon([coordinates]);

	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const centerPoint = center(extentPoly);
	const isInside = inside(centerPoint, footprintFeature);
	return isInside;
}
