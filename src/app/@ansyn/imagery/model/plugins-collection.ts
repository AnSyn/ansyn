import { InjectionToken, ValueProvider } from '@angular/core';
import { BaseImageryPluginClass	} from '@ansyn/imagery/model/base-imagery-plugin';

export const PLUGINS_COLLECTIONS: InjectionToken<ImageryCollectionEntity[]> = new InjectionToken('PLUGINS_COLLECTIONS');
export type ImageryCollectionEntity = BaseImageryPluginClass;

export interface PluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<ImageryCollectionEntity[]>;
	useValue: Array<ImageryCollectionEntity>;
	multi: true;
}

export function createCollection(providers: Array<ImageryCollectionEntity>): PluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTIONS,
		useValue: providers,
		multi: true
	};
}
