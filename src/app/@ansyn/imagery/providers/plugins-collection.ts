import { InjectionToken, ValueProvider } from '@angular/core';
import { BaseImageryPluginConstructor	} from '../model/base-imagery-plugin';

export const PLUGINS_COLLECTIONS: InjectionToken<ImageryCollectionEntity[]> = new InjectionToken('PLUGINS_COLLECTIONS');
export type ImageryCollectionEntity = BaseImageryPluginConstructor;

export interface PluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<ImageryCollectionEntity[]>;
	useValue: Array<ImageryCollectionEntity>;
	multi: true;
}

export function createPluginsCollection(providers: Array<ImageryCollectionEntity>): PluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTIONS,
		useValue: providers,
		multi: true
	};
}
