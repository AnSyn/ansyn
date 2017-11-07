import * as GeoJSON from 'geojson';
import * as  bbox from '@turf/bbox';
import * as  bboxPolygon from '@turf/bbox-polygon';
import * as center from '@turf/center';
import * as inside from '@turf/inside';
import { polygon } from '@turf/helpers';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';

export function calcGeoJSONExtent(footprint: GeoJSON.MultiPolygon): GeoJSON.Point[] {
	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const bboxResult = bbox(footprintFeature);
	const bboxPolygonResult = bboxPolygon(bboxResult);
	let boundingBox: GeoJSON.Point[] = [];
	bboxPolygonResult.geometry.coordinates[0].forEach((p) => {
		const coord: GeoJSON.Point = {
			coordinates: [p[0], p[1], p.length > 2 ? p[2] : 0],
			type: 'Point'
		};
		boundingBox.push(coord);
	});
	return boundingBox;
}

export function extentToPolygon(extent: GeoJSON.Point[]) {
	let coordinates = [];
	if (extent.length === 2) {
		// Keep this order otherwise self intersection!
		coordinates.push(extent[0].coordinates);
		coordinates.push([extent[0].coordinates[0], extent[1].coordinates[1]]);
		coordinates.push(extent[1].coordinates);
		coordinates.push([extent[1].coordinates[0], extent[0].coordinates[1]]);
	} else {
		coordinates = extent.map((p: GeoJSON.Point) => p.coordinates);
	}

	coordinates.push(coordinates[0]);

	return polygon([coordinates]);
}

export function isExtentContainedInPolygon(extent: GeoJSON.Point[], footprint: GeoJSON.MultiPolygon): boolean {
	const extentPoly = extentToPolygon(extent);

	const footprintFeature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': footprint
	};

	const centerPoint = center(extentPoly);
	return inside(centerPoint, footprintFeature);
}

export function getFootprintIntersectionRatioInExtent(extent: GeoJSON.Point[], footprint: GeoJSON.MultiPolygon): number {
	const extentPolygon = extentToPolygon(extent);

	const extentArea = area(extentPolygon);

	try {
		let intersectionArea = 0;
		footprint.coordinates.forEach(coordinates => {
			intersectionArea += area(intersect(extentPolygon, polygon(coordinates)));
		});

		return intersectionArea / extentArea;
	} catch (e) {
		return 0;
	}
}
