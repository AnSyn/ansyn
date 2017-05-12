import { EventEmitter } from '@angular/core';
import { ImageryCommunicator } from '../api/imageryCommunicator';
import { Position } from '@ansyn/core'
/**
 * Created by AsafMasa on 25/04/2017.
 */

export interface IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<Position>;

	mapType: string;
	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point, animation: boolean);
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	setLayer(layer: any): void;
	addLayer(layer: any): void;
	addVectorLayer(layer: any): void;
	removeVectorLayer(layer: any): void;
	setPosition(Position): void;
	getPosition(): Position;
	updateSize(): void;
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	addGeojsonLayer(data: GeoJSON.GeoJsonObject);
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
