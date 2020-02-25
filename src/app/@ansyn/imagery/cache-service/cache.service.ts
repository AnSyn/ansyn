import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '../model/iimagery-config';
import { IMAGERY_CONFIG } from '../model/configuration.token';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { ImageryLayerProperties } from '../model/imagery-layer.model';

@Injectable()
export class CacheService {

	protected cacheSize = this.config.maxCachedLayers || 100;
	protected cachedLayersMap: Map<string, any> = new Map<string, any>();

	constructor(@Inject(IMAGERY_CONFIG) protected config: IImageryConfig,
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

	isDisplayedLayer(cacheId) {
		return this.imageryCommunicatorService
			.communicatorsAsArray()
			.some((communicator) => {
				const communicatorLayers = communicator.getLayers();
				return communicatorLayers.some((layer) => (layer.get && layer.get(ImageryLayerProperties.CACHE_ID)) === cacheId);
			});
	}

	getLayerFromCache(cacheId: string): any {
		const layer = this.cachedLayersMap.get(cacheId);
		return layer && !this.isDisplayedLayer(cacheId) ? layer : null;
	}

	addLayerToCache(cacheId: string, layer: any) {
		if (this.cachedLayersMap.size >= this.cacheSize) {
			const key = this.cachedLayersMap.keys().next();
			let disposedLayer = this.cachedLayersMap.get(key.value);
			if (disposedLayer && disposedLayer.disposeLayer) {
				disposedLayer.disposeLayer(disposedLayer)
			}
			this.cachedLayersMap.delete(key.value);
			disposedLayer = undefined;
		}
		if (layer.set) {
			layer.set(ImageryLayerProperties.CACHE_ID, cacheId)
		}
		this.cachedLayersMap.set(cacheId, layer);
	}
}
