import { EventEmitter } from '@angular/core';
import { IMap } from './imap';
import { MapPosition } from './map-position';


export interface IMapComponent {
	mapCreated: EventEmitter<IMap>;

	createMap(layers: any, position?: MapPosition): void;
}
