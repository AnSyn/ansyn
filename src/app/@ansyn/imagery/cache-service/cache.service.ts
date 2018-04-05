import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '@ansyn/imagery/model/iimagery-config';
import { ConfigurationToken } from '@ansyn/imagery/model/configuration.token';
import { ImageryCommunicatorService } from '@ansyn/imagery';

@Injectable()
export class CacheService {

	protected cacheSize = this.config.maxCachedLayers || 100;
	protected cachedLayesrMap: Map<string, any> = new Map<string, any>();

	constructor(@Inject(ConfigurationToken) protected config: IImageryConfig,
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

	isDisplayedLayer(layers) {
		return this.imageryCommunicatorService
			.communicatorsAsArray()
			.some((communicator) => {
				const communicatorLayers = communicator.getLayers();
				return layers.some((layer) => communicatorLayers.includes(layer));
			})
	}

	getLayerFromCache(overlay: any): any[] {
		const layers = this.cachedLayesrMap.get(this.createLayerId(overlay));
		return layers && !this.isDisplayedLayer(layers) ? [ ...layers ] : [];
	}

	addLayerToCache(overlay: any, layers: any[]) {
		if (this.cachedLayesrMap.size >= this.cacheSize) {
			const key = this.cachedLayesrMap.keys().next();
			this.cachedLayesrMap.delete(key.value);
		}
		this.cachedLayesrMap.set(this.createLayerId(overlay), [...layers]);
	}

	removeLayerFromCache(overlay: any) {
		this.cachedLayesrMap.delete(this.createLayerId(overlay));
	}

	createLayerId(overlay: any): string {
		return `${overlay.sourceType}/${JSON.stringify(overlay)}`;
	}
}
