import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-source-provider.model';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerBingSourceProviderSourceType = 'BING';

@Injectable()
export class OpenLayerBingSourceProvider extends BaseMapSourceProvider {
	public mapTypes = [OpenlayersMapName, DisabledOpenLayersMapName];
	public sourceType = OpenLayerBingSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}

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
