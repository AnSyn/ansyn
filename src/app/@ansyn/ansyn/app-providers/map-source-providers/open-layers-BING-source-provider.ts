import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { Injectable } from '@angular/core';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerBingSourceProviderMapType = OpenlayersMapName;
export const OpenLayerBingSourceProviderSourceType = 'BING';

@Injectable()
export class OpenLayerBingSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerBingSourceProviderMapType;
	public sourceType = OpenLayerBingSourceProviderSourceType;

	create(metaData: any, mapId: string): any[] {
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
