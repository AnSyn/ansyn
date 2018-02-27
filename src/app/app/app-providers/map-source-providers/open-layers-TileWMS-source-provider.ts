import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';
import { Injectable } from '@angular/core';

export const OpenLayerTileWMSSourceProviderMapType = 'openLayersMap';
export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';


@Injectable()
export class OpenLayerTileWMSSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerTileWMSSourceProviderMapType;
	public sourceType = OpenLayerTileWMSSourceProviderSourceType;

	create(metaData: any, mapId: string): any {
		const id = this.sourceType;
		const cacheLayers = this.cacheService.getLayerFromCache(id);
		if (cacheLayers) {
			return [...cacheLayers];
		}

		const layers = metaData.layers.join(',');


		const source = new TileWMS(<any>{
			preload: Infinity,
			url: metaData.url,
			params: {
				'VERSION': '1.1.1',
				LAYERS: layers
			},
			projection: metaData.projection
		});

		this.monitorSource(source, mapId);

		const tiled = new TileLayer({ visible: true, source });
		this.cacheService.addLayerToCache(id, [tiled]);
		return [tiled];
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
