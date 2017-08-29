/**
 * Created by EldadCohen on 22/05/2017.
 */

import { BaseMapSourceProvider, ProjectableRaster } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';

export const OpenLayerMapBoxSourceProviderMapType = 'openLayersMap';
export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

export class OpenLayerMapBoxSourceProvider extends BaseMapSourceProvider {

	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerMapBoxSourceProviderMapType;
		this.sourceType = OpenLayerMapBoxSourceProviderSourceType;
	}

	create(metaData: any): any {
		/*
		const source = layer.getSource();

		 */
		const source = new XYZ({
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


		const mapBoxLayer = new TileLayer({
            source: source,
            visible: true,
            preload: Infinity
			});
		return [mapBoxLayer];
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
