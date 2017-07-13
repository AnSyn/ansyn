/**
 * Created by AsafMas on 12/07/2017.
 */
import * as ol from 'openlayers';

export class Utils {
	static BoundingBoxToOLExtent(bbox: GeoJSON.Point[]): ol.Extent | any {
		const coordinates: ol.Coordinate[] = [];

		bbox.forEach((p)=> {
			coordinates.push([p.coordinates[0], p.coordinates[1]]);
		});
		const geoViewExtent: ol.Extent = ol.extent.boundingExtent(coordinates);
		return geoViewExtent;
	}

	static OLExtentToBoundingBox(extent: ol.Extent): GeoJSON.Point[] {
		const topLeft = ol.extent.getTopLeft(extent);
		const bottomRight = ol.extent.getBottomRight(extent);

		let boundingBox: GeoJSON.Point[] = [];
		[topLeft, bottomRight].forEach((p)=> {
			const coord: GeoJSON.Point = {
				coordinates: [p[0], p[1], p.length > 2 ? p[2] : 0],
				type: 'Point'
			};
			boundingBox.push(coord);
		});
		return boundingBox;
	}
}
