import { FactoryProvider, Injector } from '@angular/core';
import { BaseImageryPlugin, BaseImageryPluginConstructor } from '../../model/base-imagery-plugin';
import { ImageryCollectionEntity, PLUGINS_COLLECTIONS } from '../../providers/plugins-collection';
import { BaseImageryMap } from '../../model/base-imagery-map';
import { StaticClassProvider } from '@angular/core/src/di/provider';

export function BaseImageryPluginProviderFactory(pluginsCollections: Array<ImageryCollectionEntity[]>, parent: Injector, map: BaseImageryMap) {
		const providers: StaticClassProvider[] = pluginsCollections
			.reduce<ImageryCollectionEntity[]>((previousValue, collection) => [...previousValue, ...collection], [])
			.filter((value: BaseImageryPluginConstructor) => value.prototype instanceof BaseImageryPlugin)
			.filter((value: BaseImageryPluginConstructor) => value.supported.some(ins => map instanceof ins))
			.map<StaticClassProvider>((value: BaseImageryPluginConstructor) => ({
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
	deps: [PLUGINS_COLLECTIONS, Injector, BaseImageryMap]
};
