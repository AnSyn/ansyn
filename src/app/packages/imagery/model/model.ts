import { EventEmitter } from '@angular/core';
import { IImageryCommunicator } from '../api/imageryCommunicator';
import { Position } from '@ansyn/core';
/**
 * Created by AsafMasa on 25/04/2017.
 */
export interface IMapConfig {
	mapType: string;
	mapSource: string;
	mapSourceMetadata: any;
}

export interface IImageryConfig {
	geoMapsInitialMapSource: IMapConfig[];
}

export interface IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<Position>;

	mapType: string;
	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point, animation: boolean);
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	setLayer(layer: any, extent?: Extent): void;
	addLayer(layer: any): void;
	removeLayer(layer: any): void;
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
	createMap(layers: any, position?: Position): void;
}

export interface IMapPlugin {
	pluginName: string;
	isEnabled: boolean;

	setImageryCommunicator(imageryCommunicator: IImageryCommunicator): void;
	dispose();
}

export interface Extent {
	topLeft: GeoJSON.Position;
	topRight: GeoJSON.Position;
	bottomLeft: GeoJSON.Position;
	bottomRight: GeoJSON.Position;
}
