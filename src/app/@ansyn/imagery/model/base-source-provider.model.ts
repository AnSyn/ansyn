import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';

@Injectable()
export abstract class BaseMapSourceProvider {
	abstract mapType: string;

	abstract sourceType: string;

		constructor(protected store: Store<any>, protected cacheService: CacheService,
					protected imageryCommunicatorService: ImageryCommunicatorService) {
		}

	protected createOrGetFromCache(metaData: any) {
		const cacheLayers = this.cacheService.getLayerFromCache(metaData);
		if (cacheLayers.length) {
			return cacheLayers;
		}

		const layers = this.create(metaData);
		this.cacheService.addLayerToCache(metaData, layers);
		return layers;
	}

	protected abstract create(metaData: any): any[];

	createAsync(metaData: any): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer);
	}
}
