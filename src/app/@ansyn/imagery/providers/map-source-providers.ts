import {
	BaseMapSourceProvider,
	BaseMapSourceProviderConstructor,
	IMAGERY_MAP_SOURCE_PROVIDERS
} from '../model/base-map-source-provider';
import { FactoryProvider, Provider } from '@angular/core';

export function BaseMapSourceProviderFactory(mapSourceProviders) {
	return mapSourceProviders.reduce((a, mapSourceProvider) => [...a, ...mapSourceProvider], []);
}

export function MapSourceProvidersFactory(...mapSourceProviders) {
	return mapSourceProviders;
}

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
