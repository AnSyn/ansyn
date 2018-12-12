import { InjectionToken, FactoryProvider, Provider } from '@angular/core';
import { MultipleOverlaysSource } from '../services/multiple-source-provider';

export interface IOverlaysMetadata {
	overlaySourceProviders: any[];
}

export const OVERLAYS_SOURCE_PROVIDERS = new InjectionToken('OVERLAYS_SOURCE_PROVIDERS');

export function BaseOverlaySourceProvidersFactory(mapSourceProviders) {
	return mapSourceProviders.reduce((a, mapSourceProvider) => [...a, ...mapSourceProvider], []);
}

export function OveralysSourceProvidersFactory(...providers) {
	return providers;
}

export function createOverlaysSourceProviders(providers: any[]): Provider[] {
	return [
		providers,
		{
			provide: OVERLAYS_SOURCE_PROVIDERS,
			useFactory: OveralysSourceProvidersFactory,
			deps: providers,
			multi: true
		}
	];
}

export const BaseOverlaySourceFactoryProvider: FactoryProvider = {
	provide: MultipleOverlaysSource,
	useFactory: BaseOverlaySourceProvidersFactory,
	deps: [OVERLAYS_SOURCE_PROVIDERS]
};
