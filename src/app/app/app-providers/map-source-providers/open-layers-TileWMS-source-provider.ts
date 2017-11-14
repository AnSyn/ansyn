import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

export const OpenLayerTileWMSSourceProviderMapType = 'openLayersMap';
export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';


@Injectable()
export class OpenLayerTileWMSSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerTileWMSSourceProviderMapType;
	public sourceType = OpenLayerTileWMSSourceProviderSourceType;

	constructor(store: Store<any>) {
		super(store);
	}

	create(metaData: any, mapId: string): any {
		const layers = metaData.layers.join(',');


		const source = new TileWMS({
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
		return [tiled];
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
