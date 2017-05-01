import { EventEmitter } from '@angular/core';
import {ImageryManager} from '../manager/imageryManager';

/**
 * Created by AsafMasa on 27/04/2017.
 */
export interface IImageryCommunicator {
	setBoundingView(boundingRectangle: GeoJSON.MultiPolygon);
	setCenter(center: GeoJSON.Point);

	getMapObject(): any;
	getCenter(): GeoJSON.Point;
}

export class ImageryCommunicator implements IImageryCommunicator {

	private _manager: ImageryManager;
	private _subscriptions;
	public centerChanged: EventEmitter<GeoJSON.Point>;

	constructor() {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
	}

	public setImageryManager(manager: ImageryManager) {
		this._manager = manager;
		this._subscriptions = [];
		this.registerToManagerEvents();
	}

	private registerToManagerEvents() {
		this._subscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));
	}

	public setBoundingView(boundingRectangle: GeoJSON.MultiPolygon) {
		this._manager.setBoundingView(boundingRectangle);
	}

	public setCenter(center: GeoJSON.Point) {
		this._manager.setCenter(center);
	}

	public getMapObject() {
		return this._manager.getMapObject();
	}

	getCenter(): GeoJSON.Point {
		return this._manager.getMapCenter();
	}

	public dispose() {
		for (let i = 0; i < this._subscriptions.length; i++) {
			this._subscriptions[i].unsubscribe();
		}
		this._subscriptions = [];
	}
}
