import { EventEmitter } from '@angular/core';
import { IMap } from './imap';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';


export interface IMapComponent {
	mapCreated: EventEmitter<IMap>;

	createMap(layers: any, position?: ICaseMapPosition): void;
}
