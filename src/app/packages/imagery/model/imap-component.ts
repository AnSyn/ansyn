import { EventEmitter } from '@angular/core';
import { IMap } from './imap';
import { MapPosition } from './map-position';

/**
 * Created by AsafMas on 06/06/2017.
 */

export interface IMapComponent {
	mapCreated: EventEmitter<IMap>;
	createMap(layers: any, position?: MapPosition): void;
}
