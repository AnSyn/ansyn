import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '../model/iimagery-config';
import { ConfigurationToken } from '../model/configuration.token';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';

@Injectable()
export class CacheService {

	protected cacheSize = this.config.maxCachedLayers || 100;
	protected cachedLayesrMap: Map<string, any> = new Map<string, any>();

	constructor(@Inject(ConfigurationToken) protected config: IImageryConfig,
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

	isDisplayedLayer(layers, cacheId) {
		return this.imageryCommunicatorService
			.communicatorsAsArray()
			.some((communicator) => {
				const communicatorLayers = communicator.getLayers();
				return layers.some((layer) => communicatorLayers.some((layer) => layer.get('cacheId') === cacheId));
			})
	}

	getLayerFromCache(overlay: any): any[] {
		const cacheId = this.createLayerId(overlay);
		const layers = this.cachedLayesrMap.get(cacheId);
		return layers && !this.isDisplayedLayer(layers, cacheId) ? [ ...layers ] : [];
	}

	addLayerToCache(overlay: any, layers: any[]) {
		if (this.cachedLayesrMap.size >= this.cacheSize) {
			const key = this.cachedLayesrMap.keys().next();
			this.cachedLayesrMap.delete(key.value);
		}
		const cacheId = this.createLayerId(overlay);
		layers.forEach((layer) => layer.set('cacheId', cacheId));
		this.cachedLayesrMap.set(cacheId, [...layers]);
	}

	removeLayerFromCache(overlay: any) {
		this.cachedLayesrMap.delete(this.createLayerId(overlay));
	}

	createLayerId(overlay: any): string {
		return `${overlay.sourceType}/${JSON.stringify(overlay)}`;
	}
}
