import { FactoryProvider, InjectionToken, ValueProvider } from '@angular/core';
import { IBaseImageryMapConstructor } from '../model/base-imagery-map';

export const IMAGERY_MAPS_COLLECTIONS = new InjectionToken<IBaseImageryMapConstructor[][]>('IMAGERY_MAPS_COLLECTIONS');
export const IMAGERY_MAPS = new InjectionToken<IBaseImageryMapConstructor[]>('IMAGERY_MAPS');

export function ImageryMapsFactory(imageryIMapCollection: IBaseImageryMapConstructor[][]) {
	return imageryIMapCollection.reduce((a, b) => [...a, ...b], []);
}

export function createImageryMapsCollection(imageryMaps: IBaseImageryMapConstructor[]): ValueProvider {
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
