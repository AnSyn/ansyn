import { IMap } from '@ansyn/imagery/model/imap';
import { EventEmitter, Injectable } from '@angular/core';
import { GeoJsonObject, Point } from 'geojson';
import { Observable } from 'rxjs/Observable';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
export const CesiumMapName = 'cesium';

@Injectable()
export class CesiumMap extends IMap {
	static groupLayers = new Map<string, any>();

	centerChanged: EventEmitter<Point> = new EventEmitter<Point>();
	positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any> = new EventEmitter<any>();
	contextMenu: EventEmitter<any> = new EventEmitter<any>();
	mapType: string = CesiumMapName;
	mapObject: any;

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition): Observable<boolean> {
		this.mapObject = {};
		return Observable.of(false);
	}

	getCenter(): Observable<Point> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	toggleGroup(groupName: string) {
		throw new Error('Method not implemented.');
	}

	resetView(layer: any): Observable<boolean> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(position: CaseMapPosition): Observable<boolean> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	getPosition(): Observable<CaseMapPosition> {
		return Observable.throw(new Error('Method not implemented.'));
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

	getLayers(): any[] {
		return [];
	}

	removeSingleClickEvent() {

	}

	addLayerIfNotExist() {

	}
	getRotation(): number {
		return NaN;
	}

	dispose() {
	}

	addSingleClickEvent() {
		throw new Error('Method not implemented.');
	}

}
