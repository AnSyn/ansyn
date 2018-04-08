import { EventEmitter } from '@angular/core';
import { IMap } from './imap';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { BaseImageryPlugin } from '@ansyn/imagery';


export interface ImageryMapComponent {
	mapCreated: EventEmitter<IMap>;
	plugins: BaseImageryPlugin[];
	createMap(layers: any, position?: CaseMapPosition): void;
}
