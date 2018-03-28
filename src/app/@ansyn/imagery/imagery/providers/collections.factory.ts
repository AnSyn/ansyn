import { Injector } from '@angular/core';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { ImageryPluginProvider, PLUGINS_COLLECTION } from '../../model/plugins-collection';

export function getBaseImageryPluginFactory(mapName: string) {
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
