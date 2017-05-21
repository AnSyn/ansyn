import { EventEmitter } from '@angular/core';
import { ImageryManager } from '../manager/imageryManager';
import { IPlugginCommunicator } from '../model/model';
import { Position } from '@ansyn/core';

import * as _ from 'lodash';

/**
 * Created by AsafMasa on 27/04/2017.
 */
export interface IImageryCommunicator {
	plugginCommunicatorAdded: EventEmitter<string>;
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<Position>;

	init(manager: ImageryManager);

	setBoundingView(boundingRectangle: GeoJSON.MultiPolygon);
	setCenter(center: GeoJSON.Point, animation ?: boolean);
	setActiveMap(mapType: string);
	setLayer(layer: any);
	addLayer(layer: any);
	addVectorLayer(layer: any): void;
	removeVectorLayer(layer: any): void;
	setPosition(Position): void;
	updateSize(): void;
	addGeojsonLayer(data: GeoJSON.GeoJsonObject): void
	getActiveMapObject(): any;
	getCenter(): GeoJSON.Point;
	getPlugginCommunicator(plugginId: string): IPlugginCommunicator;
	registerPlugginCommunicator(plugginId: string, plugginCommunicator: IPlugginCommunicator);
}

export class ImageryCommunicator implements IImageryCommunicator {
	private _manager: ImageryManager;
	private _managerSubscriptions;
	private _plugginCommunicators: { [id: string]: IPlugginCommunicator };

	public positionChanged: EventEmitter<Position>;
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public plugginCommunicatorAdded: EventEmitter<string>;

	constructor(private _id: string) {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<Position>();
		this.plugginCommunicatorAdded = new EventEmitter<string>();
		this._plugginCommunicators = {};
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));
		this._managerSubscriptions.push(this._manager.positionChanged.subscribe((position: Position ) => {
			this.positionChanged.emit(position);
		}));

	}

	private unregisterToManagerEvents() {
		for (let i = 0; i < this._managerSubscriptions.length; i++) {
			this._managerSubscriptions[i].unsubscribe();
		}
		this._managerSubscriptions = [];
	}

	public dispose() {
		this.unregisterToManagerEvents();
	}

	//IImageryCommunicator methods begin

	public init(manager: ImageryManager) {
		this._manager = manager;
		this._managerSubscriptions = [];
		this.registerToManagerEvents();
	}
	public setActiveMap(mapType: string) {
		this._manager.setActiveMap(mapType);
	}

	public getActiveMapObject() {
		return this._manager.getMapObject();
	}

	public getCenter(): GeoJSON.Point {
		return this._manager.getMapCenter();
	}
	public updateSize(): void {
		if (!this._manager) {
			console.warn(`'id ${this._id}', can't update size communicator manager is not set`);
			return;
		}
		return this._manager.updateSize();
	}
	public addGeojsonLayer(data: GeoJSON.GeoJsonObject) {
		return this._manager.addGeojsonLayer(data);
	}
	public setBoundingView(boundingRectangle: GeoJSON.MultiPolygon) {
		this._manager.setBoundingView(boundingRectangle);
	}

	public setCenter(center: GeoJSON.Point, animation ?: boolean) {
		const animate = (_.isNil(animation)) ? true : animation;
		this._manager.setCenter(center, animate);
	}

	public setPosition(position: Position) {
		this._manager.setPosition(position);
	}

	public registerPlugginCommunicator(plugginId: string, plugginCommunicator: IPlugginCommunicator) {
		if (this._plugginCommunicators[plugginId]) {
			throw new Error(`'Pluggin Communicator ${plugginId} is already registered.'`);
		}

		this._plugginCommunicators[plugginId] = plugginCommunicator;
		this.plugginCommunicatorAdded.emit(plugginId);
	}

	public getPlugginCommunicator(plugginId: string): IPlugginCommunicator {
		return this._plugginCommunicators[plugginId];
	}

	public setLayer(layer: any) {
		this._manager.setLayer(layer);
	}

	public addLayer(layer: any) {
		this._manager.addLayer(layer);
	}

    public addVectorLayer(layer: any): void {
		this._manager.addVectorLayer(layer);
	}

	public removeVectorLayer(layer: any): void {
		this._manager.removeVectorLayer(layer);
	}

	//IImageryCommunicator methods end
}
