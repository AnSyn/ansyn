import { FactoryProvider, Injector, StaticProvider } from '@angular/core';
import { BaseImageryPlugin } from '../../plugins/base-imagery-plugin';
import { PLUGINS_COLLECTION, ImageryPluginProvider } from '../../plugins/plugins-collection';

export function baseImageryPluginFactory(pluginsCollection: Array<ImageryPluginProvider[]>, parent: Injector) {
	const providers = pluginsCollection
		.reduce((v, i) => [...v, ...i], [])
		.filter(({ provide }: ImageryPluginProvider) => provide === BaseImageryPlugin);

	if (providers.length === 0) {
		return [];
	}
	const childInjector = Injector.create(providers, parent);
	return childInjector.get(BaseImageryPlugin);
}


export const PluginsProvider: FactoryProvider = {
	provide: BaseImageryPlugin,
	useFactory: baseImageryPluginFactory,
	deps: [PLUGINS_COLLECTION, Injector]
};
