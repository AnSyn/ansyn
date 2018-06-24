import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { Injectable } from '@angular/core';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export const OpenLayerBingSourceProviderSourceType = 'BING';

@Injectable()
export class OpenLayerBingSourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerBingSourceProviderSourceType;

	create(metaData: any): any[] {
		const source = new BingMaps({
			key: metaData.key,
			imagerySet: metaData.styles[0],
			maxZoom: 19
		});

		const result = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source
		});
		return [result];
	}
}
