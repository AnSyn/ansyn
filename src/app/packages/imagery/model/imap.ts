import { EventEmitter } from '@angular/core';
import { MapPosition } from './map-position';
import { Observable } from 'rxjs/Observable';

export abstract class IMap<T = any> {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;
	contextMenu: EventEmitter<any>;
	mapType: string;
	mapObject: T;

	static addGroupLayer(layer: any, groupName: string) {
	}

	static removeGroupLayer(layer: any, groupName: string) {
	}

	static addGroupVectorLayer(layer: any, groupName: string) {
	}

	abstract getCenter(): GeoJSON.Point;

	abstract setCenter(center: GeoJSON.Point, animation: boolean);

	abstract setBoundingBox(bbox: GeoJSON.Point[]);

	abstract toggleGroup(groupName: string);

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param {any} layer The new layer to set the view with. this layer projection will be the views projection
	 * @param {GeoJSON.Point[]} extent The extent (bounding box points) of the map at ESPG:4326
	 */
	abstract resetView(layer: any, extent?: GeoJSON.Point[]): void;

	abstract addLayer(layer: any): void;

	abstract removeLayer(layer: any): void;

	abstract setPosition(MapPosition): void;

	abstract getPosition(): MapPosition;

	abstract setRotation(rotation: number): void;

	abstract updateSize(): void;

	abstract addGeojsonLayer(data: GeoJSON.GeoJsonObject);

	abstract setAutoImageProcessing(shouldPerform: boolean): void;

	abstract setManualImageProcessing(processingParams: Object): void;

	abstract dispose(): void;

	abstract setPointerMove(enable: boolean);

	abstract getPointerMove(): Observable<any>;

	abstract addSingleClickEvent();

	abstract removeSingleClickEvent();

	abstract addLayerIfNotExist(layer: any);
}
