import { InjectionToken, Injector } from '@angular/core';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { ImageryPluginProvider, PLUGINS_COLLECTIONS } from '../../model/plugins-collection';

export const MAP_NAME: InjectionToken<string> = new InjectionToken('MAP_NAME');

export function BaseImageryPluginProviderFactory(pluginsCollections: Array<ImageryPluginProvider[]>, parent: Injector, mapName: string) {
		const providers = pluginsCollections
			.reduce((previousValue, collection) => [...previousValue, ...collection], [])
			.filter(({ provide, useClass }: ImageryPluginProvider) => provide === BaseImageryPlugin && useClass.supported.includes(mapName));

		if (providers.length === 0) {
			return [];
		}
		const childInjector = Injector.create(providers, parent);
		return childInjector.get(BaseImageryPlugin);
}

export const BaseImageryPluginProvider = {
	provide: BaseImageryPlugin,
	useFactory: BaseImageryPluginProviderFactory,
	deps: [PLUGINS_COLLECTIONS, Injector, MAP_NAME]
};

export function ProvideMapName(name: string) {
	return {
		provide: MAP_NAME,
		useValue: name
	}
}
