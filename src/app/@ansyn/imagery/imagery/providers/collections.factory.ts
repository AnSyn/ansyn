import { Injector } from '@angular/core';
import { BaseImageryPlugin } from '../../plugins/base-imagery-plugin';
import { ImageryPluginProvider, PLUGINS_COLLECTION } from '../../plugins/plugins-collection';

export function getPluginsProvider(mapName: string) {
	return {
		provide: BaseImageryPlugin,
		useFactory(pluginsCollection: Array<ImageryPluginProvider[]>, parent: Injector) {
			const providers = pluginsCollection
				.reduce((v, i) => [...v, ...i], [])
				.filter(({ provide, useClass }: ImageryPluginProvider) => provide === BaseImageryPlugin && useClass.mapName === mapName);

			if (providers.length === 0) {
				return [];
			}
			const childInjector = Injector.create(providers, parent);
			return childInjector.get(BaseImageryPlugin);
		},
		deps: [PLUGINS_COLLECTION, Injector]
	};
}
