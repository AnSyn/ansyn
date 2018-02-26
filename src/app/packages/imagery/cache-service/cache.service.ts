import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '@ansyn/imagery/model/iimagery-config';
import { ConfigurationToken } from '@ansyn/imagery/configuration.token';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-source-provider.model';

@Injectable()
export class CacheService {

	protected cacheSize = 100;
	protected cachedLayesrMap: Map<string, any> = new Map<string, any>();

	constructor(@Inject(ConfigurationToken) protected config: IImageryConfig) {
		this.cacheSize = config.maxCachedLayers;
	}

	getLayerFromCache(id: string) {
		return this.cachedLayesrMap.get(id);
	}

	addLayerToCache(id: string, layer: any) {
		if (this.cachedLayesrMap.size >= this.cacheSize) {
			const key = this.cachedLayesrMap.keys().next();
			this.cachedLayesrMap.delete(key.value);
		}
		this.cachedLayesrMap.set(id, layer);
	}
}
