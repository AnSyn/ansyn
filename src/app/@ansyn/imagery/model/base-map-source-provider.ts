import { Inject, Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { Observable, of } from 'rxjs';
import { IBaseImageryMapConstructor } from './base-imagery-map';
import { ICaseMapState } from '../../ansyn/modules/menu-items/cases/models/case.model';
import { ImageryLayerProperties } from './imagery-layer.model';
import { IMapSettings } from './map-settings';

export const IMAGERY_MAP_SOURCE_PROVIDERS = new InjectionToken('IMAGERY_MAP_SOURCE_PROVIDERS');

export const MAP_SOURCE_PROVIDERS_CONFIG = 'mapSourceProvidersConfig';

export interface IMapSourceProvidersConfig<T = any> {
	[key: string]: T;
}

export interface IImageryMapSourceMetaData {
	readonly sourceType: string;
	readonly supported?: IBaseImageryMapConstructor[];
}

export interface IBaseMapSourceProviderConstructor {
	new(...args): BaseMapSourceProvider
}

@Injectable()
export abstract class BaseMapSourceProvider<CONF = any> implements IImageryMapSourceMetaData {
	readonly sourceType: string;
	readonly supported?: IBaseImageryMapConstructor[];

	protected get config(): CONF {
		return this.mapSourceProvidersConfig[this.sourceType];
	}

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig<CONF>) {
	}

	generateLayerId(metaData: ICaseMapState): string {
		// if (this.forOverlay) {
		// 	return `${metaData.worldView.mapType}/${JSON.stringify(metaData.data.overlay)}`;
		// }
		// return `${metaData.worldView.mapType}/${metaData.worldView.sourceType}`;
		return ''
	}

	protected createOrGetFromCache(metaData: IMapSettings) {
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

	protected abstract create(metaData: IMapSettings): any[];

	createAsync(metaData: IMapSettings): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer);
	}

	existsInCache(metaData: IMapSettings): boolean {
		const cacheId = this.generateLayerId(metaData);
		const cacheLayers = this.cacheService.getLayerFromCache(cacheId);
		return cacheLayers.length > 0;
	}

	getExtraData(metaData: IMapSettings) {

	};

	removeExtraData(layer: any) {
	}
}
