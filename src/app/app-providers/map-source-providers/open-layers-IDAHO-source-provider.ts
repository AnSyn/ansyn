/**
 * Created by EldadCohen on 22/05/2017.
 */

import { BaseMapSourceProvider, ProjectableRaster } from '@ansyn/imagery';
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
		/*
		const source = layer.getSource();

		 */
		const source = new ol.source.XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		source.once('tileloadstart',() => {
			/*
			this will work every request for tile source and will have slightly effect on performance (one function call) nothing wo worry about
			 */
			super.startTimingLog("tile_load-" + metaData.id);
		});

		source.once('tileloadend',() => {
			super.endTimingLog("tile_load-"+ metaData.id);
		});


		const osmLayer = new ol.layer.Image({
			source: new ProjectableRaster({
				sources: [source],
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
