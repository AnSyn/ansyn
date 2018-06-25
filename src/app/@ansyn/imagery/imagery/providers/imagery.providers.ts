import { FactoryProvider, Injector } from '@angular/core';
import { BaseImageryPlugin, BaseImageryPluginClass } from '../../model/base-imagery-plugin';
import { ImageryCollectionEntity, PLUGINS_COLLECTIONS } from '../../providers/plugins-collection';
import { IMap } from '../../model/imap';
import { StaticClassProvider } from '@angular/core/src/di/provider';

export function BaseImageryPluginProviderFactory(pluginsCollections: Array<ImageryCollectionEntity[]>, parent: Injector, map: IMap) {
		const providers: StaticClassProvider[] = pluginsCollections
			.reduce<ImageryCollectionEntity[]>((previousValue, collection) => [...previousValue, ...collection], [])
			.filter((value: BaseImageryPluginClass) => value.prototype instanceof BaseImageryPlugin)
			.filter((value: BaseImageryPluginClass) => value.supported.some(ins => map instanceof ins))
			.map<StaticClassProvider>((value: BaseImageryPluginClass) => ({
				provide: BaseImageryPlugin,
				useClass: value,
				multi: true,
				deps: [...value.deps]
			}));

		if (providers.length === 0) {
			return [];
		}

		const childInjector = Injector.create(providers, parent);
		return childInjector.get(BaseImageryPlugin);
}

export const BaseImageryPluginProvider: FactoryProvider = {
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
