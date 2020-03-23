import { FactoryProvider, InjectionToken, ValueProvider } from '@angular/core';
import { IBaseImageryMapConstructor } from '../model/base-imagery-map';

export const IMAGERY_MAPS_COLLECTIONS = new InjectionToken<IBaseImageryMapConstructor[][]>('IMAGERY_MAPS_COLLECTIONS');
export const IMAGERY_MAPS = new InjectionToken<IImageryMaps>('IMAGERY_MAPS');

export interface IImageryMaps {
	[mapType: string]: IBaseImageryMapConstructor;
}

export function ImageryMapsFactory(imageryIMapCollection: IBaseImageryMapConstructor[][]) {
	return imageryIMapCollection.reduce((a, b) => [...a, ...b], []).reduce((object, baseImageryMapConstructor: IBaseImageryMapConstructor) => {
		return { ...object, [baseImageryMapConstructor.prototype.mapType]: baseImageryMapConstructor }
	}, {});
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
