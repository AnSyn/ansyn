/**
 * Created by AsafMas on 12/07/2017.
 */
import Extent from 'ol/extent';
import Coordinate from 'ol/coordinate';

export class Utils {
	static BoundingBoxToOLExtent(bbox: GeoJSON.Point[]): Extent | any {
		const coordinates: Coordinate[] = [];

		bbox.forEach((p) => {
			coordinates.push([p.coordinates[0], p.coordinates[1]]);
		});
		const geoViewExtent: Extent = Extent.boundingExtent(coordinates);
		return geoViewExtent;
	}

	static OLExtentToBoundingBox(extent: Extent): GeoJSON.Point[] {
		const topLeft = Extent.getTopLeft(extent);
		const bottomRight = Extent.getBottomRight(extent);

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
