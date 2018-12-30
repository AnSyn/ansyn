import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '../model/iimagery-config';
import { IMAGERY_CONFIG } from '../model/configuration.token';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { ICaseMapState } from '@ansyn/core';

@Injectable({
	providedIn: 'root'
})
export class CacheService {

	protected cacheSize = this.config.maxCachedLayers || 100;
	protected cachedLayesrMap: Map<string, any> = new Map<string, any>();

	constructor(@Inject(IMAGERY_CONFIG) protected config: IImageryConfig,
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

	isDisplayedLayer(layers, cacheId) {
		return this.imageryCommunicatorService
			.communicatorsAsArray()
			.some((communicator) => {
				const communicatorLayers = communicator.getLayers();
				return layers.some((layer) => communicatorLayers.some((layer) => (layer.get && layer.get('cacheId')) === cacheId));
			});
	}

	getLayerFromCache(cacheId: string): any[] {
		const layers = this.cachedLayesrMap.get(cacheId);
		return layers && !this.isDisplayedLayer(layers, cacheId) ? [...layers] : [];
	}

	addLayerToCache(cacheId: string, layers: any[]) {
		if (this.cachedLayesrMap.size >= this.cacheSize) {
			const key = this.cachedLayesrMap.keys().next();
			this.cachedLayesrMap.delete(key.value);
		}
		layers.filter((layer) => Boolean(layer.set)).forEach((layer) => layer.set('cacheId', cacheId));
		this.cachedLayesrMap.set(cacheId, [...layers]);
	}
}
