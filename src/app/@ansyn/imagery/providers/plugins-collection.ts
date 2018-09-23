import { InjectionToken, ValueProvider } from '@angular/core';
import { IBaseImageryPluginConstructor } from '../model/base-imagery-plugin';

export const PLUGINS_COLLECTIONS: InjectionToken<ImageryCollectionEntity[]> = new InjectionToken('PLUGINS_COLLECTIONS');
export type ImageryCollectionEntity = IBaseImageryPluginConstructor;

export interface IPluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<ImageryCollectionEntity[]>;
	useValue: Array<ImageryCollectionEntity>;
	multi: true;
}

export function createPluginsCollection(providers: Array<ImageryCollectionEntity>): IPluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTIONS,
		useValue: providers,
		multi: true
	};
}
