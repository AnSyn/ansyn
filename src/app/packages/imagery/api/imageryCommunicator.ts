import { EventEmitter } from '@angular/core';
import {ImageryManager} from '../manager/imageryManager';
import {IPlugginCommunicator} from '../model/model';

/**
 * Created by AsafMasa on 27/04/2017.
 */
export interface IImageryCommunicator {
	plugginCommunicatorAdded: EventEmitter<string>;
	centerChanged: EventEmitter<GeoJSON.Point>;

	init(manager: ImageryManager);

	setBoundingView(boundingRectangle: GeoJSON.MultiPolygon);
	setCenter(center: GeoJSON.Point);
	setActiveMap(mapType: string);
	setLayer(layer: any);

	getActiveMapObject(): any;
	getCenter(): GeoJSON.Point;
	getPlugginCommunicator(plugginId: string): IPlugginCommunicator;
	registerPlugginCommunicator(plugginId: string, plugginCommunicator: IPlugginCommunicator);
}

export class ImageryCommunicator implements IImageryCommunicator {
	private _manager: ImageryManager;
	private _managerSubscriptions;
	private _plugginCommunicators: { [id: string]: IPlugginCommunicator };

	public centerChanged: EventEmitter<GeoJSON.Point>;
	public plugginCommunicatorAdded: EventEmitter<string>;

	constructor() {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.plugginCommunicatorAdded = new EventEmitter<string>();
		this._plugginCommunicators = {};
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
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
		throw new Error('Method not implemented.');
	}

	public getActiveMapObject() {
		return this._manager.getMapObject();
	}

	public getCenter(): GeoJSON.Point {
		return this._manager.getMapCenter();
	}

	public setBoundingView(boundingRectangle: GeoJSON.MultiPolygon) {
		this._manager.setBoundingView(boundingRectangle);
	}

	public setCenter(center: GeoJSON.Point) {
		this._manager.setCenter(center);
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

	//IImageryCommunicator methods end
}
