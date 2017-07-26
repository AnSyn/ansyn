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

	mapType: string;
	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point, animation: boolean);
	setBoundingBox(bbox: GeoJSON.Point[]);
	setLayer(layer: any, extent?: GeoJSON.Point[]): void;
	addLayer(layer: any): void;
	removeLayer(layer: any): void;
	addVectorLayer(layer: any): void;
	removeVectorLayer(layer: any): void;
	setPosition(MapPosition): void;
	getPosition(): MapPosition;
	updateSize(): void;
	addGeojsonLayer(data: GeoJSON.GeoJsonObject);
	togglePointerMove();
	removeSingleClickEvent();
	shouldPerformHistogram(shouldPerform: boolean): void;
	isHistogramActive(): boolean;
}
