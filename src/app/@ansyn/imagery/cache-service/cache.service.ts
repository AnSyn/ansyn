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
			this.removeLayerFromCache();
		}
		if (layer.set) {
			layer.set(ImageryLayerProperties.CACHE_ID, cacheId)
		}
		this.cachedLayersMap.set(cacheId, layer);
	}

	private removeLayerFromCache() {
		const keys = Array.from(this.cachedLayersMap.keys());
		let key: string;
		for ( let i = 0; i < keys.length; i++) {
			const isLayerDisplayed = this.isDisplayedLayer(keys[i]);
			if (!isLayerDisplayed) {
				key = keys[i];
				break;
			}
		}
		if (Boolean(key)) {
			let disposedLayer = this.cachedLayersMap.get(key);
			if (disposedLayer && disposedLayer.disposeLayer) {
				disposedLayer.disposeLayer(disposedLayer);
			}
			this.cachedLayersMap.delete(key);
			disposedLayer = undefined;
			if (this.cachedLayersMap.size > this.cacheSize) {
				this.removeLayerFromCache();
			}
		}
	}
}
