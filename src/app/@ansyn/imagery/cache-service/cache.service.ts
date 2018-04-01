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

	getLayerFromCache(id: string): any[] {
		const layers = this.cachedLayesrMap.get(id);
		return layers ? [ ...layers ] : [];
	}

	addLayerToCache(id: string, layers: any[]) {
		if (this.cachedLayesrMap.size >= this.cacheSize) {
			const key = this.cachedLayesrMap.keys().next();
			this.cachedLayesrMap.delete(key.value);
		}
		this.cachedLayesrMap.set(id, [...layers]);
	}

	removeLayerFromCache(id: string) {
		this.cachedLayesrMap.delete(id);
	}
}
