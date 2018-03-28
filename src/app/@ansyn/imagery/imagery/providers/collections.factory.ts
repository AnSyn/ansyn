import { InjectionToken, Injector } from '@angular/core';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { ImageryPluginProvider, PLUGINS_COLLECTION } from '../../model/plugins-collection';

export const baseInjectablePlugins = [BaseImageryPlugin];

export function getPluginsProvider(injectableClass: any, mapName: string) {
	return {
		provide: injectableClass,
		useFactory(pluginsCollection: Array<ImageryPluginProvider[]>, parent: Injector) {
			const providers = pluginsCollection
				.reduce((v, i) => [...v, ...i], [])
				.filter(({ provide, useClass }: ImageryPluginProvider) => provide === injectableClass && useClass.mapName === mapName);

			if (providers.length === 0) {
				return [];
			}
			const childInjector = Injector.create(providers, parent);
			return childInjector.get(injectableClass);
		},
		deps: [PLUGINS_COLLECTION, Injector]
	};
}

export function getPluginsProviders(mapName: string) {
	return baseInjectablePlugins.map((injectableClass) => {
		return getPluginsProvider(injectableClass, mapName);
	});
}
