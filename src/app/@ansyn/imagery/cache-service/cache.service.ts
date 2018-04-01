import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '@ansyn/imagery/model/iimagery-config';
import { ConfigurationToken } from '@ansyn/imagery/model/configuration.token';

@Injectable()
export class CacheService {

	protected cacheSize = 100;
	protected cachedLayesrMap: Map<string, any> = new Map<string, any>();

	constructor(@Inject(ConfigurationToken) protected config: IImageryConfig) {
		this.cacheSize = config.maxCachedLayers;
	}

	getLayerFromCache(overlay: any): any[] {
		const layers = this.cachedLayesrMap.get(this.createLayerId(overlay));
		return layers ? [ ...layers ] : [];
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
