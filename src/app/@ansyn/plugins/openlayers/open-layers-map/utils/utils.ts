import * as ol from 'openlayers';
import olExtent from 'ol/extent';
import { Point } from 'geojson';

export class Utils {
	static BoundingBoxToOLExtent(bbox: Point[]): ol.Extent | any {
		const coordinates = <ol.Coordinate[]> bbox.map((p) => [p.coordinates[0], p.coordinates[1]]);
		return olExtent.boundingExtent(coordinates);
	}

	static OLExtentToBoundingBox(extent: ol.Extent): Point[] {
		const topLeft = olExtent.getTopLeft(extent);
		const bottomRight = olExtent.getBottomRight(extent);

		let boundingBox: Point[] = [];
		[topLeft, bottomRight].forEach((p) => {
			const coord: Point = {
				coordinates: [p[0], p[1], p.length > 2 ? p[2] : 0],
				type: 'Point'
			};
			boundingBox.push(coord);
		});
		return boundingBox;
	}
}
