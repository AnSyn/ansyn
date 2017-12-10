import { EventEmitter } from '@angular/core';
import { MapPosition } from './map-position';
import { Observable } from 'rxjs/Observable';

export interface IMap<T = any> {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;
	contextMenu: EventEmitter<any>;
	mapType: string;
	mapObject: T;

	getCenter(): GeoJSON.Point;

	setCenter(center: GeoJSON.Point, animation: boolean);

	setBoundingBox(bbox: GeoJSON.Point[]);

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param {any} layer The new layer to set the view with. this layer projection will be the views projection
	 * @param {GeoJSON.Point[]} extent The extent (bounding box points) of the map at ESPG:4326
	 */
	resetView(layer: any, extent?: GeoJSON.Point[]): void;

	addLayer(layer: any, groupName?: string): void;

	removeLayer(layer: any, groupName?: string): void;

	addVectorLayer(layer: any, groupName?: string): void;

	removeVectorLayer(layer: any, groupName?: string): void;

	setPosition(MapPosition): void;

	getPosition(): MapPosition;

	setRotation(rotation: number): void;

	updateSize(): void;

	addGeojsonLayer(data: GeoJSON.GeoJsonObject);

	setAutoImageProcessing(shouldPerform: boolean): void;

	setManualImageProcessing(processingParams: Object): void;

	dispose(): void;

	setPointerMove(enable: boolean);

	getPointerMove(): Observable<any>;

	removeSingleClickEvent();

	addSingleClickEvent();

	removeSingleClickEvent();

	addLayerIfNotExist(layer: any);
}
