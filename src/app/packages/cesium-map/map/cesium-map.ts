/**
 * Created by AsafMas on 11/05/2017.
 */
import { IMap, MapPosition } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { GeoJsonObject } from 'geojson';

export class CesiumMap implements IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;

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

	setLayer(layer: any): void {
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

	shouldPerformHistogram(shouldPerform: boolean): void {
		throw new Error('Method not implemented.');		
	}

	isHistogramActive(): boolean {
		throw new Error('Method not implemented.');		
	}

	togglePointerMove(){
	}

	removeSingleClickEvent(){

	}

	constructor(element: HTMLElement) {
		this.mapType = 'cesium';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.mapObject = {};
	}




}
