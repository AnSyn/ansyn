import { EventEmitter } from '@angular/core';
import { IMap } from './imap';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';


export interface IMapComponent {
	mapCreated: EventEmitter<IMap>;

	createMap(layers: any, position?: CaseMapPosition): void;
}
