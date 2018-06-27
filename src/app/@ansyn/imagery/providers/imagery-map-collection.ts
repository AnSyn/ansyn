import { FactoryProvider, InjectionToken, ValueProvider } from '@angular/core';
import { IMapConstructor } from '../model/imap';

export const IMAGERY_MAPS_COLLECTIONS = new InjectionToken<IMapConstructor[][]>('IMAGERY_MAPS_COLLECTIONS');
export const IMAGERY_MAPS = new InjectionToken<IMapConstructor[]>('IMAGERY_MAPS');

export function ImageryMapsFactory(imageryIMapCollection: IMapConstructor[][]) {
	return imageryIMapCollection.reduce((a, b) => [...a, ...b], []);
}

export function createImageryMapsCollection(imageryMaps: IMapConstructor[]): ValueProvider {
	return {
		provide: IMAGERY_MAPS_COLLECTIONS,
		useValue: imageryMaps,
		multi: true
	};
}

export const ImageryMapsProvider: FactoryProvider = {
	provide: IMAGERY_MAPS,
	useFactory: ImageryMapsFactory,
	deps: [IMAGERY_MAPS_COLLECTIONS]
};
