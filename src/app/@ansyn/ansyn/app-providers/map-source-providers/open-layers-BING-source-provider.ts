import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export interface IBingMapsConfig {
	key: string;
	styles: string[];
}

export const BING_MAPS_CONFIG = new InjectionToken('BING_MAPS_CONFIG');
export const OpenLayerBingSourceProviderSourceType = 'BING';

@Injectable()
export class OpenLayerBingSourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerBingSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(BING_MAPS_CONFIG) protected bingMapsConfig: IBingMapsConfig) {
		super(store, cacheService, imageryCommunicatorService);
	}

	create(metaData: any = this.bingMapsConfig): any[] {
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
