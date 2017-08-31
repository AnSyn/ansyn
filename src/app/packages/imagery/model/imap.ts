import { EventEmitter } from '@angular/core';
import { MapPosition } from './map-position';

/**
 * Created by AsafMas on 06/06/2017.
 */

export interface IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;
	contextMenu: EventEmitter<any>;
	mapType: string;
	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point, animation: boolean);
	setBoundingBox(bbox: GeoJSON.Point[]);

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param The new layer to set the view with. this layer projection will be the views projection
	 * @param {Point[]} the extent (bounding box points) of the map at ESPG:4326
	 */
	resetView(layer: any, extent?: GeoJSON.Point[]): void;
	addLayer(layer: any): void;
	removeLayer(layer: any): void;
	addVectorLayer(layer: any): void;
	removeVectorLayer(layer: any): void;
	setPosition(MapPosition): void;
	getPosition(): MapPosition;
	updateSize(): void;
	addGeojsonLayer(data: GeoJSON.GeoJsonObject);
	setAutoImageProcessing(shouldPerform: boolean): void;
	dispose(): void;

	// TODO: move them to pluggins
	togglePointerMove();
	removeSingleClickEvent();
	startMouseShadowVectorLayer();
	stopMouseShadowVectorLayer();
	drawShadowMouse(latLon);
	addSingleClickEvent();
	removeSingleClickEvent();
	addPinPointIndicator(latLon);
	removePinPointIndicator();
}
