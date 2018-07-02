import {
	BaseMapSourceProvider,
	BaseMapSourceProviderConstructor,
	IMAGERY_MAP_SOURCE_PROVIDERS
} from '../model/base-map-source-provider';
import { FactoryProvider, Provider } from '@angular/core';

/**
 * @description Factory for Merge an array of arrays to single array ( BaseMapSourceProvider[] )
 */
export function BaseMapSourceProviderFactory(mapSourceProviders) {
	return mapSourceProviders.reduce((a, mapSourceProvider) => [...a, ...mapSourceProvider], []);
}

/**
 * @description Enable to get single array of BaseMapSourceProvider[] for multi array
 */
export function MapSourceProvidersFactory(...mapSourceProviders) {
	return mapSourceProviders;
}

/**
 * @description Factory for Merge an array of arrays ( BaseMapSourceProvider )
 */
export function createMapSourceProviders(mapSourceProviders: BaseMapSourceProviderConstructor[]): Provider[] {
	return [
		mapSourceProviders,
		{
			provide: IMAGERY_MAP_SOURCE_PROVIDERS,
			useFactory: MapSourceProvidersFactory,
			deps: mapSourceProviders,
			multi: true
		}
	];
}

export const BaseMapSourceProviderProvider: FactoryProvider = {
	provide: BaseMapSourceProvider,
	useFactory: BaseMapSourceProviderFactory,
	deps: [IMAGERY_MAP_SOURCE_PROVIDERS]
};
