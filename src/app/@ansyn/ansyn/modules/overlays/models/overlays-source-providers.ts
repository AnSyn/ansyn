import { FactoryProvider, Injectable, InjectionToken, Provider } from '@angular/core';
import { BaseOverlaySourceProvider } from './base-overlay-source-provider.model';

export interface IOverlaySourceProviderConstructor {
	new(...args): BaseOverlaySourceProvider;
}

export const MultipleOverlaysSource: InjectionToken<IMultipleOverlaysSource> = new InjectionToken('multiple-overlays-sources');

export interface IMultipleOverlaysSource {
	[sourceType: string]: BaseOverlaySourceProvider
}

export function OverlaySourceProvider({ sourceType }: { sourceType: string }) {
	console.log(sourceType);
	return function (constructor: IOverlaySourceProviderConstructor) {
		Injectable()(constructor);
		constructor.prototype.sourceType = sourceType;
	};
}

export interface IOverlaysMetadata {
	overlaySourceProviders: IOverlaySourceProviderConstructor[];
}

export const OVERLAYS_SOURCE_PROVIDERS = new InjectionToken('OVERLAYS_SOURCE_PROVIDERS');

export function BaseOverlaySourceProvidersFactory(mapSourceProviders): IMultipleOverlaysSource {
	return mapSourceProviders
		.reduce((a, overlaySourceProviders) => [...a, ...overlaySourceProviders], [])
		.reduce((mapSourceProviders, overlaySourceProvider: BaseOverlaySourceProvider) => {
			return { ...mapSourceProviders, [overlaySourceProvider.sourceType]: overlaySourceProvider};
		}, {});
}

export function OveralysSourceProvidersFactory(...providers) {
	return providers;
}

export function createOverlaysSourceProviders(providers: IOverlaySourceProviderConstructor[]): Provider[] {
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
