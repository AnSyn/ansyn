import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { Injectable } from '@angular/core';

export const OpenLayerBingSourceProviderMapType = 'openLayersMap';
export const OpenLayerBingSourceProviderSourceType = 'BING';

@Injectable()
export class OpenLayerBingSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerBingSourceProviderMapType;
	public sourceType = OpenLayerBingSourceProviderSourceType;

	create(metaData: any, mapId: string): any {
		return metaData.styles.map(style => {
			const source = new BingMaps({
				key: metaData.key,
				imagerySet: style,
				maxZoom: 19
			});

			this.monitorSource(source, mapId);

			return new TileLayer(<any>{
				visible: true,
				preload: Infinity,
				source
			});
		});
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
