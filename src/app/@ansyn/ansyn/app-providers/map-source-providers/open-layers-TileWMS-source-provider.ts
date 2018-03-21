import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';
import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { openLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerTileWMSSourceProviderMapType = openLayersMapName;
export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';


@Injectable()
export class OpenLayerTileWMSSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerTileWMSSourceProviderMapType;
	public sourceType = OpenLayerTileWMSSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}

	create(metaData: any, mapId: string): any[] {
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
		return [tiled];
	}
}
