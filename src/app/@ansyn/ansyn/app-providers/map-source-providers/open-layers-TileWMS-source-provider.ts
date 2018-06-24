import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';
import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';


@Injectable()
export class OpenLayerTileWMSSourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerTileWMSSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService);
	}

	create(metaData: any): any[] {
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

		const tiled = new TileLayer({ visible: true, source });
		return [tiled];
	}
}
