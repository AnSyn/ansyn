import {
	IMAGERY_MAP_COMPONENTS,
	IMAGERY_MAP_COMPONENTS_COLLECTION, ImageryMapComponentConstructor,
	ImageryMapComponentFactory
} from '../model/imagery-map-component';
import { ANALYZE_FOR_ENTRY_COMPONENTS, FactoryProvider, ValueProvider } from '@angular/core';

export function createComponentCollection(components: ImageryMapComponentConstructor[]): ValueProvider[] {
	return [
		{
			provide: IMAGERY_MAP_COMPONENTS_COLLECTION,
			useValue: components,
			multi: true
		},
		{
			provide: ANALYZE_FOR_ENTRY_COMPONENTS,
			useValue: components,
			multi: true
		}
	];
}

export const MapComponentsProvider: FactoryProvider = {
	provide: IMAGERY_MAP_COMPONENTS,
	useFactory: ImageryMapComponentFactory,
	deps: [IMAGERY_MAP_COMPONENTS_COLLECTION]
};
