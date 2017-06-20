import { EventEmitter } from '@angular/core';
import { Extent } from './extent';
import { MapPosition } from './map-position';

/**
 * Created by AsafMas on 06/06/2017.
 */

export interface IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;

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
	setPosition(MapPosition): void;
	getPosition(): MapPosition;
	updateSize(): void;
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	addGeojsonLayer(data: GeoJSON.GeoJsonObject);
	togglePointerMove();
	removeSingleClickEvent();
}
