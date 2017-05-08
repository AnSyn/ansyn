import {EventEmitter} from '@angular/core';
import { ImageryCommunicator } from '../api/imageryCommunicator';
/**
 * Created by AsafMasa on 25/04/2017.
 */

export interface IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	mapType: string;

	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point);
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
}

export interface IMapComponent {
	mapCreated: EventEmitter<IMap>;
}

export interface IMapState {
	mapStateType: string;

	setImageryCommunicator(imageryCommunicator: ImageryCommunicator): void;
}

export interface IPlugginCommunicator {
	plugginId: string;
}
