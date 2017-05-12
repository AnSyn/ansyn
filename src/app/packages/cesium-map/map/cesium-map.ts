/**
 * Created by AsafMas on 11/05/2017.
 */
import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { GeoJsonObject } from 'geojson';

export class CesiumMap implements IMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<{zoom: number; center: GeoJSON.Point; }>;
	mapType: string;
	mapObject: any;

	getCenter(): GeoJSON.Point {
		throw new Error('Method not implemented.');
	}

	setCenter(center: GeoJSON.Point, animation: boolean) {
		throw new Error('Method not implemented.');
	}

	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
	setBoundingRectangle(rect: any) {
		throw new Error('Method not implemented.');
	}

	setLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	addVectorLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeVectorLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(Position: any): void {
		throw new Error('Method not implemented.');
	}

	getPosition(): {zoom: number; center: GeoJSON.Point;} {
		throw new Error('Method not implemented.');
	}

	updateSize(): void {
		throw new Error('Method not implemented.');
	}

	addGeojsonLayer(data: GeoJsonObject) {
		throw new Error('Method not implemented.');
	}


	constructor(element: HTMLElement) {
		this.mapType = 'cesium';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<{ zoom: number; center: GeoJSON.Point; }>();
		this.mapObject = {};
	}




}
