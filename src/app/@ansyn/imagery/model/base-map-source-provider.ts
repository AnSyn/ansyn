import { Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { Observable, of } from 'rxjs';
import { IBaseImageryMapConstructor } from './base-imagery-map';
import { ICaseMapState } from '@ansyn/core/models/case.model';

export const IMAGERY_MAP_SOURCE_PROVIDERS = new InjectionToken('IMAGERY_MAP_SOURCE_PROVIDERS');

export interface IImageryMapSourceMetaData {
	sourceType?: string;
	supported?: IBaseImageryMapConstructor[];
}

export interface IBaseMapSourceProviderConstructor extends IImageryMapSourceMetaData {
	new(...args): BaseMapSourceProvider
}

@Injectable()
export abstract class BaseMapSourceProvider {

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	protected createOrGetFromCache(metaData: ICaseMapState) {
		const cacheLayers = this.cacheService.getLayerFromCache(metaData);
		if (cacheLayers.length) {
			return cacheLayers;
		}

		const layers = this.create(metaData);
		this.cacheService.addLayerToCache(metaData, layers);
		return layers;
	}

	protected abstract create(metaData: ICaseMapState): any[];

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer);
	}

	existsInCache(metaData: ICaseMapState): boolean {
		const cacheLayers = this.cacheService.getLayerFromCache(metaData);
		return cacheLayers.length > 0;
	}

	getThumbnailUrl(overlay, position): Observable<string> {
		return of(overlay.thumbnailUrl);
	}

	removeExtraData(layer: any) {
	}
}
