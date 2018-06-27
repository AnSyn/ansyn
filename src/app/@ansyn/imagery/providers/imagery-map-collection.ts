import { InjectionToken } from '@angular/core';
import { IMapConstructor } from '../model/imap';

export const IMAGERY_MAP_COLLECTIONS = new InjectionToken<IMapConstructor[][]>('IMAGERY_MAP_COLLECTIONS');
export const IMAGERY_MAPS = new InjectionToken<IMapConstructor[]>('IMAGERY_IMAPS');

export function ImageryIMapFactory(imageryIMapCollection: IMapConstructor[][]) {
	return imageryIMapCollection.reduce((a, b) => [...a, ...b], []);
}

export function createImageryMapsCollection(imageryMaps: IMapConstructor[]) {
	return {
		provide: IMAGERY_MAP_COLLECTIONS,
		useValue: imageryMaps,
		multi: true
	};
}
