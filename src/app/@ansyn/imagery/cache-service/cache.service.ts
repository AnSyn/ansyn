import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '../model/iimagery-config';
import { IMAGERY_CONFIG } from '../model/configuration.token';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { cloneDeep as cloneDeepLodash } from 'lodash';
import { ImageryLayerProperties } from '../model/imagery-layer.model';

@Injectable()
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
				return layers.some((layer) => communicatorLayers.some((layer) => (layer.get && layer.get(ImageryLayerProperties.CACHE_ID)) === cacheId));
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
		layers.filter((layer) => Boolean(layer.set)).forEach((layer) => layer.set(ImageryLayerProperties.CACHE_ID, cacheId));
		// Cloning the layers, in order to set a flag only in the cached layers
		const clonedLayers = cloneDeepLodash(layers);
		clonedLayers.filter((layer) => Boolean(layer.set)).forEach((layer) => layer.set(ImageryLayerProperties.FROM_CACHE, true));
		//
		this.cachedLayesrMap.set(cacheId, clonedLayers);
	}
}
