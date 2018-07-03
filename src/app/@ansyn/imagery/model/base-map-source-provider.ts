import { Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { Observable, of } from 'rxjs';
import { BaseImageryMapConstructor } from './base-imagery-map';
import { CaseMapState } from '@ansyn/core/models/case.model';

export const IMAGERY_MAP_SOURCE_PROVIDERS = new InjectionToken('IMAGERY_MAP_SOURCE_PROVIDERS');

export interface ImageryMapSourceMetaData {
	sourceType?: string;
	supported?: BaseImageryMapConstructor[];
}

export interface BaseMapSourceProviderConstructor extends ImageryMapSourceMetaData {
	new(...args): BaseMapSourceProvider
}

@Injectable()
export abstract class BaseMapSourceProvider {

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	protected createOrGetFromCache(metaData: CaseMapState) {
		const cacheLayers = this.cacheService.getLayerFromCache(metaData);
		if (cacheLayers.length) {
			return cacheLayers;
		}

		const layers = this.create(metaData);
		this.cacheService.addLayerToCache(metaData, layers);
		return layers;
	}

	protected abstract create(metaData: CaseMapState): any[];

	createAsync(metaData: CaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer);
	}

	getThumbnailUrl(overlay, position): Observable<string> {
		return of(overlay.thumbnailUrl);
	}
}
