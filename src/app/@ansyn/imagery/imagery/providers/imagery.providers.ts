import { InjectionToken, Injector } from '@angular/core';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { ImageryPluginProvider, PLUGINS_COLLECTIONS } from '../../model/plugins-collection';
import { IMap } from '@ansyn/imagery';

export function BaseImageryPluginProviderFactory(pluginsCollections: Array<ImageryPluginProvider[]>, parent: Injector, map: IMap) {
		const providers = pluginsCollections
			.reduce((previousValue, collection) => [...previousValue, ...collection], [])
			.filter(({ provide, useClass }: ImageryPluginProvider) => provide === BaseImageryPlugin && useClass.supported.includes(map.mapType));

		if (providers.length === 0) {
			return [];
		}
		const childInjector = Injector.create(providers, parent);
		return childInjector.get(BaseImageryPlugin);
}

export const BaseImageryPluginProvider = {
	provide: BaseImageryPlugin,
	useFactory: BaseImageryPluginProviderFactory,
	deps: [PLUGINS_COLLECTIONS, Injector, IMap]
};

export function ProvideMap(implementaion: any) {
	return {
		provide: IMap,
		useClass: implementaion
	}
}
