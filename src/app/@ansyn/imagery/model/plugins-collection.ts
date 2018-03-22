import { InjectionToken, ModuleWithProviders, ValueProvider } from '@angular/core';
import { StaticClassProvider } from '@angular/core/src/di/provider';
import { ImageryModule } from '@ansyn/imagery/imagery.module';

export const PLUGINS_COLLECTION: InjectionToken<ImageryPluginProvider[]> = new InjectionToken('PLUGINS_COLLECTION');

export interface PluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<ImageryPluginProvider[]>;
	useValue: Array<ImageryPluginProvider>;
	multi: true;
}

export interface ImageryPluginProvider extends StaticClassProvider {
	provide: any;
	useClass: any;
	multi: true;
}

export function createCollection(providers: Array<ImageryPluginProvider>): PluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTION,
		useValue: providers,
		multi: true
	};
}
