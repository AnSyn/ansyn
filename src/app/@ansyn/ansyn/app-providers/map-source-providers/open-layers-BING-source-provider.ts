import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { Injectable } from '@angular/core';
import { openLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

export const OpenLayerBingSourceProviderMapType = openLayersMapName;
export const OpenLayerBingSourceProviderSourceType = 'BING';

@Injectable()
export class OpenLayerBingSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerBingSourceProviderMapType;
	public sourceType = OpenLayerBingSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}

	create(metaData: any, mapId: string): any[] {
		const source = new BingMaps({
			key: metaData.key,
			imagerySet: metaData.styles[0],
			maxZoom: 19
		});

		this.monitorSource(source, mapId);

		const result = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source
		});
		return [result];
	}
}
