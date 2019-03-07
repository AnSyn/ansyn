import { Inject, Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { Observable, of } from 'rxjs';
import { IBaseImageryMapConstructor } from './base-imagery-map';
import { ICaseMapState, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
import {
	IMapSourceProvidersConfig
} from '@ansyn/core';
import { ImageryLayerProperties } from './imagery-layer.model';

export const IMAGERY_MAP_SOURCE_PROVIDERS = new InjectionToken('IMAGERY_MAP_SOURCE_PROVIDERS');

export interface IImageryMapSourceMetaData {
	readonly sourceType: string;
	readonly supported?: IBaseImageryMapConstructor[];
	readonly forOverlay?: boolean;
}

export interface IBaseMapSourceProviderConstructor {
	new(...args): BaseMapSourceProvider
}

@Injectable()
export abstract class BaseMapSourceProvider<CONF = any> implements IImageryMapSourceMetaData {
	readonly sourceType: string;
	readonly supported?: IBaseImageryMapConstructor[];
	readonly forOverlay?: boolean;

	protected get config(): CONF {
		return this.mapSourceProvidersConfig[this.sourceType];
	}

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
	}

	generateLayerId(metaData: ICaseMapState): string {
		if (this.forOverlay) {
			return `${metaData.worldView.mapType}/${JSON.stringify(metaData.data.overlay)}`;
		}
		return `${metaData.worldView.mapType}/${metaData.worldView.sourceType}`;
	}

	protected createOrGetFromCache(metaData: ICaseMapState) {
		const cacheId = this.generateLayerId(metaData);
		const cacheLayers = this.cacheService.getLayerFromCache(cacheId);
		if (cacheLayers.length) {
			cacheLayers.forEach((layer) => {
				if (layer.set) {
					layer.set(ImageryLayerProperties.FROM_CACHE, true);
				}
			});
			return cacheLayers;
		}

		const layers = this.create(metaData);
		this.cacheService.addLayerToCache(cacheId, layers);
		return layers;
	}

	protected abstract create(metaData: ICaseMapState): any[];

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer);
	}

	existsInCache(metaData: ICaseMapState): boolean {
		const cacheId = this.generateLayerId(metaData);
		const cacheLayers = this.cacheService.getLayerFromCache(cacheId);
		return cacheLayers.length > 0;
	}

	getThumbnailUrl(overlay, position): Observable<string> {
		return of(overlay.thumbnailUrl);
	}

	getThumbnailName(overlay): string {
		return overlay.sensorName;
	}

	removeExtraData(layer: any) {
	}
}
