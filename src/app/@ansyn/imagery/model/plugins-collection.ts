import { InjectionToken, ValueProvider } from '@angular/core';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

export const PLUGINS_COLLECTIONS: InjectionToken<BaseImageryPluginClass[]> = new InjectionToken('PLUGINS_COLLECTIONS');

export interface PluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<BaseImageryPluginClass[]>;
	useValue: Array<BaseImageryPluginClass>;
	multi: true;
}

export interface BaseImageryPluginClass {
	supported?: string[];
	deps?: string[];
	new(...args): BaseImageryPlugin;
}

export function createCollection(providers: Array<BaseImageryPluginClass>): PluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTIONS,
		useValue: providers,
		multi: true
	};
}
