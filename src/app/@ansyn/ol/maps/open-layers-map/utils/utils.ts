import olPolygon, { fromExtent } from 'ol/geom/Polygon';
import * as olExtent from 'ol/extent';
import { Point } from 'geojson';
import { ImageryMapExtent } from '@ansyn/imagery';

// @dynamic
export class Utils {
	static BoundingBoxToOLExtent(bbox: Point[]): [number, number, number, number] | any {
		const coordinates = <[number, number][]>bbox.map((p) => [p.coordinates[0], p.coordinates[1]]);
		return olExtent.boundingExtent(coordinates);
	}

	static OLExtentToBoundingBox(extent: [number, number, number, number]): Point[] {
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

	static extentToOlPolygon(extent: ImageryMapExtent): olPolygon {
		return fromExtent(extent);
	}
}
