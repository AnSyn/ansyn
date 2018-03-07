import * as ol from 'openlayers';
import olExtent from 'ol/extent';

export class Utils {
	static BoundingBoxToOLExtent(bbox: GeoJSON.Point[]): ol.Extent | any {
		const coordinates = <ol.Coordinate[]> bbox.map((p) => [p.coordinates[0], p.coordinates[1]]);
		return olExtent.boundingExtent(coordinates);
	}

	static OLExtentToBoundingBox(extent: ol.Extent): GeoJSON.Point[] {
		const topLeft = olExtent.getTopLeft(extent);
		const bottomRight = olExtent.getBottomRight(extent);

		let boundingBox: GeoJSON.Point[] = [];
		[topLeft, bottomRight].forEach((p) => {
			const coord: GeoJSON.Point = {
				coordinates: [p[0], p[1], p.length > 2 ? p[2] : 0],
				type: 'Point'
			};
			boundingBox.push(coord);
		});
		return boundingBox;
	}
}
