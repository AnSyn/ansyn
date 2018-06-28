import { Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { Observable, of } from 'rxjs';
import { ImageryDecorator } from './imagery-decorator';

export const IMAGERY_MAP_SOURCE_PROVIDERS = new InjectionToken('IMAGERY_MAP_SOURCE_PROVIDERS');

export interface ImageryMapSourceMetaData {
	sourceType?: string;
	supported?: string[];
}

export interface BaseMapSourceProviderConstructor extends ImageryMapSourceMetaData {
	new(...args): BaseMapSourceProvider
}

@Injectable()
export abstract class BaseMapSourceProvider {

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	protected createOrGetFromCache(metaData?: any) {
		const cacheLayers = this.cacheService.getLayerFromCache(metaData);
		if (cacheLayers.length) {
			return cacheLayers;
		}

		const layers = this.create(metaData);
		this.cacheService.addLayerToCache(metaData, layers);
		return layers;
	}

	protected abstract create(metaData: any): any[];

	createAsync(metaData?: any): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer);
	}

	getThumbnailUrl(overlay, position): Observable<string> {
		return of(overlay.thumbnailUrl);
	}
}

export function ImageryMapSource(metaData: ImageryMapSourceMetaData) {
	return function (constructor: BaseMapSourceProviderConstructor) {
		Injectable()(constructor);
		ImageryDecorator<ImageryMapSourceMetaData, BaseMapSourceProviderConstructor>(metaData)(constructor)
	};
}
