import { Inject, Injectable } from '@angular/core';
import { IImageryConfig } from '../model/iimagery-config';
import { IMAGERY_CONFIG } from '../model/configuration.token';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { ICaseMapState } from '@ansyn/core/models/case.model';

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
				return layers.some((layer) => communicatorLayers.some((layer) => (layer.get && layer.get('cacheId')) === cacheId));
			});
	}

	getLayerFromCache(metaData: ICaseMapState): any[] {
		const cacheId = this.createLayerId(metaData);
		const layers = this.cachedLayesrMap.get(cacheId);
		return layers && !this.isDisplayedLayer(layers, cacheId) ? [...layers] : [];
	}

	addLayerToCache(caseMapState: ICaseMapState, layers: any[]) {
		if (this.cachedLayesrMap.size >= this.cacheSize) {
			const key = this.cachedLayesrMap.keys().next();
			this.cachedLayesrMap.delete(key.value);
		}
		const cacheId = this.createLayerId(caseMapState);
		layers.filter((layer) => Boolean(layer.set)).forEach((layer) => layer.set('cacheId', cacheId));
		this.cachedLayesrMap.set(cacheId, [...layers]);
	}

	createLayerId(caseMapState: ICaseMapState): string {
		if (caseMapState.data.overlay) {
			return `${caseMapState.mapType}/${JSON.stringify(caseMapState.data.overlay)}`;
		}
		return `${caseMapState.mapType}/${caseMapState.sourceType}`;
	}
}
