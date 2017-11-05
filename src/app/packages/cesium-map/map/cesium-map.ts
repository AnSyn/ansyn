import { IMap, MapPosition } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { GeoJsonObject } from 'geojson';
import { Observable } from 'rxjs/Observable';

export class CesiumMap implements IMap {
	static mapType = 'cesium';

	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any> = new EventEmitter<any>();
	contextMenu: EventEmitter<any> = new EventEmitter<any>();

	mapType: string;
	mapObject: any;

	getCenter(): GeoJSON.Point {
		throw new Error('Method not implemented.');
	}

	setCenter(center: GeoJSON.Point, animation: boolean) {
		throw new Error('Method not implemented.');
	}

	setBoundingBox(bbox: GeoJSON.Point[]) {
		throw new Error('Method not implemented.');
	}

	resetView(layer: any): void {
		throw new Error('Method not implemented.');
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	addVectorLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeVectorLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(MapPosition: any): void {
		throw new Error('Method not implemented.');
	}

	getPosition(): MapPosition {
		throw new Error('Method not implemented.');
	}

	updateSize(): void {
		throw new Error('Method not implemented.');
	}

	addGeojsonLayer(data: GeoJsonObject) {
		throw new Error('Method not implemented.');
	}

	setAutoImageProcessing(shouldPerform: boolean): void {
		throw new Error('Method not implemented.');
	}

	setPointerMove(enable: boolean) {
	}

	getPointerMove() {
		return new Observable();
	}

	removeSingleClickEvent() {

	}

	addLayerIfNotExist() {

	}


	constructor(element: HTMLElement) {
		this.mapType = CesiumMap.mapType;
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.mapObject = {};
	}

	dispose() {
	}

	addSingleClickEvent() {
		throw new Error('Method not implemented.');
	}

}
