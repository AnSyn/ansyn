import { IMap } from '@ansyn/imagery/model/imap';
import { CaseMapPosition } from '@ansyn/core';
import { EventEmitter } from '@angular/core';
import { GeoJsonObject } from 'geojson';
import { Observable } from 'rxjs/Observable';

export class CesiumMap extends IMap {
	static mapType = 'cesium';
	static groupLayers = new Map<string, any>();

	centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<MapPosition>();
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any> = new EventEmitter<any>();
	contextMenu: EventEmitter<any> = new EventEmitter<any>();

	mapType: string = CesiumMap.mapType;
	mapObject: any;

	constructor(element: HTMLElement) {
		super();

		this.mapObject = {};
	}

	getCenter(): GeoJSON.Point {
		throw new Error('Method not implemented.');
	}

	setCenter(center: GeoJSON.Point, animation: boolean) {
		throw new Error('Method not implemented.');
	}

	setBoundingBox(bbox: GeoJSON.Point[]) {
		throw new Error('Method not implemented.');
	}

	toggleGroup(groupName: string) {
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

	setPosition(position: CaseMapPosition): void {
		throw new Error('Method not implemented.');
	}

	getPosition(): CaseMapPosition {
		throw new Error('Method not implemented.');
	}

	setRotation(rotation: number): void {
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

	setManualImageProcessing(processingParams: Object): void {
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


	dispose() {
	}

	addSingleClickEvent() {
		throw new Error('Method not implemented.');
	}

}
