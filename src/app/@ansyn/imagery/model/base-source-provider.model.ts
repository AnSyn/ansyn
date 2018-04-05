import { Store } from '@ngrx/store';
import { SetProgressBarAction } from '@ansyn/map-facade/actions/map.actions';
import { Injectable } from '@angular/core';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils/logs/timer-logs';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';

@Injectable()
export abstract class BaseMapSourceProvider {
	abstract mapType: string;

	abstract sourceType: string;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	protected createOrGetFromCache(metaData: any, mapId: string) {
		const cacheLayers = this.cacheService.getLayerFromCache(metaData);
		if (cacheLayers.length) {
			return cacheLayers;
		}

		const layers = this.create(metaData, mapId);
		this.cacheService.addLayerToCache(metaData, layers);
		return layers;
	}

	protected abstract create(metaData: any, mapId: string): any[];

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.createOrGetFromCache(metaData, mapId);
		return Promise.resolve(layer);
	}
}
