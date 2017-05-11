import { EventEmitter } from '@angular/core';
import { ImageryCommunicator } from '../api/imageryCommunicator';
/**
 * Created by AsafMasa on 25/04/2017.
 */

export type IPosition = {
	zoom: number;
	center: GeoJSON.Point
}

export interface IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<IPosition>;

	mapType: string;
	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point, animation: boolean);
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	setLayer(layer: any): void;
	addLayer(layer: any): void;
	setPosition(IPosition): void;
	getPosition(): IPosition;
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
