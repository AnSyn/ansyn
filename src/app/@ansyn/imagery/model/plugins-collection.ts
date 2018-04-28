import { InjectionToken, ValueProvider } from '@angular/core';
import { StaticClassProvider } from '@angular/core/src/di/provider';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

export const PLUGINS_COLLECTIONS: InjectionToken<ImageryPluginProvider[]> = new InjectionToken('PLUGINS_COLLECTIONS');

export interface PluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<ImageryPluginProvider[]>;
	useValue: Array<ImageryPluginProvider>;
	multi: true;
}

export interface BaseImageryPluginClass {
	new(): BaseImageryPlugin;
}

export interface ImageryPluginProvider extends StaticClassProvider {
	provide: BaseImageryPluginClass;
	useClass: any;
	multi: true;
}

export function createCollection(providers: Array<ImageryPluginProvider>): PluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTIONS,
		useValue: providers,
		multi: true
	};
}
