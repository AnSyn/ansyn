import { InjectionToken } from '@angular/core';
import { IMapConstructor } from './imap';

export const IMAGERY_IMAP_COLLECTION = new InjectionToken<IMapConstructor[][]>('IMAGERY_IMAP_COLLECTION');
export const IMAGERY_IMAP = new InjectionToken<IMapConstructor[]>('IMAGERY_IMAP');

export function ImageryIMapFactory(imageryIMapCollection: IMapConstructor[][]) {
	return imageryIMapCollection.reduce((a, b) => [...a, ...b], []);
}
