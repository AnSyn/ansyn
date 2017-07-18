/**
 * Created by EldadCohen on 22/05/2017.
 */

import { BaseMapSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export const OpenLayerIDAHOSourceProviderMapType = 'openLayersMap';
export const OpenLayerIDAHOSourceProviderSourceType = 'IDAHO';

export class OpenLayerIDAHOSourceProvider extends BaseMapSourceProvider {

	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerIDAHOSourceProviderMapType;
		this.sourceType = OpenLayerIDAHOSourceProviderSourceType;
	}

	create(metaData: any): any {
		const osmLayer = new ol.layer.Image({
			source: new ol.source.Raster({
				sources: [new ol.source.XYZ({
					url: metaData.imageUrl,
					crossOrigin: 'Anonymous',
					projection: 'EPSG:3857'
				})],
				operation: function (pixels, data) {
					return pixels[0];
				},
				operationType: 'image'
			})
		});
		return osmLayer;
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
