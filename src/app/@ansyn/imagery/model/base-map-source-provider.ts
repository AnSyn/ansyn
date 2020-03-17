import { Inject, Injectable, InjectionToken } from '@angular/core';
import { CacheService } from '../cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { IBaseImageryMapConstructor } from './base-imagery-map';
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

	generateLayerId<META extends IMapSettings>(metaData: META): string {
		return new Date().toISOString()
	};

	protected createOrGetFromCache<META extends IMapSettings>(metaData: META): Promise<any> {
		const cacheId = this.generateLayerId(metaData);
		const cacheLayer = this.cacheService.getLayerFromCache(cacheId);
		if (cacheLayer) {
			this.setExtraData(cacheLayer, { [ImageryLayerProperties.FROM_CACHE]: true });
			return Promise.resolve(cacheLayer);
		}

		return this.create(metaData).then((layer) => {
			layer.set(ImageryLayerProperties.ID, cacheId);
			this.cacheService.addLayerToCache(cacheId, layer);
			const extraData = this.generateExtraData(metaData);
			this.setExtraData(layer, extraData);
			return layer;
		});
	}

	protected abstract create<META extends IMapSettings>(metaData: META): Promise<any>;

	createAsync<META extends IMapSettings>(metaData: META): Promise<any> {
		return this.createOrGetFromCache(metaData)
	}

	existsInCache<META extends IMapSettings>(metaData: META): boolean {
		const cacheId = this.generateLayerId(metaData);
		const cacheLayer = this.cacheService.getLayerFromCache(cacheId);
		return Boolean(cacheLayer);
	}

	generateExtraData<META extends IMapSettings>(metaData: META): any {
		return {}
	};

	setExtraData(layer: any, extraData: any): void {
	}

	removeExtraData(layer: any) {
	}
}
