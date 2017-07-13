/**
 * Created by AsafMas on 12/07/2017.
 */
import * as ol from 'openlayers';

export class Utils {
	static BoundingBoxToOLExtent(bbox: GeoJSON.Point[]): ol.Extent | any {
		const topLeft: ol.Coordinate = [bbox[0].coordinates[0], bbox[0].coordinates[1]];
		const topRight: ol.Coordinate = [bbox[1].coordinates[0], bbox[1].coordinates[1]];
		const bottomLeft: ol.Coordinate = [bbox[2].coordinates[0], bbox[2].coordinates[1]];
		const bottomRight: ol.Coordinate = [bbox[3].coordinates[0], bbox[3].coordinates[1]];
		const geoViewExtent: ol.Extent = ol.extent.boundingExtent([topLeft, topRight, bottomLeft, bottomRight]);
		return geoViewExtent;
	}

	static OLExtentToBoundingBox(extent: ol.Extent): GeoJSON.Point[] {
		const topLeft = ol.extent.getTopLeft(extent);
		const topRight = ol.extent.getTopRight(extent);
		const bottomLeft = ol.extent.getBottomLeft(extent);
		const bottomRight = ol.extent.getBottomRight(extent);

		let boundingBox: GeoJSON.Point[] = [];
		[topLeft, topRight, bottomLeft, bottomRight].forEach((p)=> {
			const coord: GeoJSON.Point = {
				coordinates: [p[0], p[1], p.length > 2 ? p[2] : 0],
				type: 'Point'
			};
			boundingBox.push(coord);
		});
		return boundingBox;
	}
}
