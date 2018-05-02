import { InjectionToken, ValueProvider } from '@angular/core';
import { BaseImageryPluginClass	} from '@ansyn/imagery/model/base-imagery-plugin';

export const PLUGINS_COLLECTIONS: InjectionToken<ImageryCollectionEntitiy[]> = new InjectionToken('PLUGINS_COLLECTIONS');
export type ImageryCollectionEntitiy = BaseImageryPluginClass;

export interface PluginsCollectionProvider extends ValueProvider {
	provide: InjectionToken<ImageryCollectionEntitiy[]>;
	useValue: Array<ImageryCollectionEntitiy>;
	multi: true;
}

export function createCollection(providers: Array<ImageryCollectionEntitiy>): PluginsCollectionProvider {
	return {
		provide: PLUGINS_COLLECTIONS,
		useValue: providers,
		multi: true
	};
}
