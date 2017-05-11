/**
 * Created by AsafMas on 11/05/2017.
 */
import { IMap } from '@ansyn/imagery';
import {EventEmitter} from '@angular/core';

export class CesiumMap implements IMap {

	centerChanged: EventEmitter<GeoJSON.Point>;
	mapObject: any;
	mapType: string;

	constructor(element: HTMLElement) {
		this.mapType = 'cesium';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.mapObject = {};
	}

	getCenter(): GeoJSON.Point {
		throw new Error('Method not implemented.');
	}

	setCenter(center: GeoJSON.Point, animation: boolean) {
		throw new Error('Method not implemented.');
	}

	setBoundingRectangle(rect: GeoJSON.MultiPolygon) {
		throw new Error('Method not implemented.');
	}

	setLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}


}
