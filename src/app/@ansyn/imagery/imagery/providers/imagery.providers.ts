import { InjectionToken, Injector } from '@angular/core';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { ImageryPluginProvider, PLUGINS_COLLECTION } from '../../model/plugins-collection';

export const MAP_NAME: InjectionToken<string> = new InjectionToken('MAP_NAME');

export function BaseImageryPluginProviderFactory(pluginsCollection: Array<ImageryPluginProvider[]>, parent: Injector, mapName: string) {
		const providers = pluginsCollection
			.reduce((v, i) => [...v, ...i], [])
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
	deps: [PLUGINS_COLLECTION, Injector, MAP_NAME]
};

export function ProvideMapName(name: string) {
	return {
		provide: MAP_NAME,
		useValue: name
	}
}
