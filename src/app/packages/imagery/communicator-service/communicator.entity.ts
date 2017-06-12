import { EventEmitter } from '@angular/core';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

import * as _ from 'lodash';
import { IMapPlugin } from '../model/imap-plugin';
import { Extent } from '../model/extent';
import { IMap } from '../model/imap';
import { MapPosition } from '../model/map-position';
import { Subject } from 'rxjs/Subject';


/**
 * Created by AsafMasa on 27/04/2017.
 */

export class CommunicatorEntity {
	private _manager: ImageryComponentManager;
	private _managerSubscriptions;
	
	public id: string;
	public positionChanged: EventEmitter<{id: string, position: MapPosition}>;
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public pointerMove: EventEmitter<any>;
	public isReady: EventEmitter<any>;

	constructor(private _id: string) {
		
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<{id: string, position: MapPosition}>();
		this.pointerMove = new EventEmitter<any>();
		this.isReady = new EventEmitter<any>();
	}



	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));
		
		this._managerSubscriptions.push(this._manager.positionChanged.subscribe((position: MapPosition ) => {
			this.positionChanged.emit({id: this._id, position});
		}));

		this._managerSubscriptions.push(this._manager.pointerMove.subscribe((latLon: Array<any> ) => {
			this.pointerMove.emit(latLon);
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

	//CommunicatorEntity methods begin

	public init(manager: ImageryComponentManager) {
		this._manager = manager;
		this._managerSubscriptions = [];
		this.registerToManagerEvents();
		this.isReady.next(true);
	}
	public setActiveMap(mapType: string) {
		this._manager.setActiveMap(mapType);
	}

	public get ActiveMap() {
		if (this._manager)
		{
			return this._manager.ActiveMap;
		}

		return null;
	}

	public getCenter(): GeoJSON.Point {
		if (this.ActiveMap) {
			return this.ActiveMap.getCenter();
		}
		return null;
	}
	public updateSize(): void {
		if (this.ActiveMap) {
			this.ActiveMap.updateSize();
		}
	}

	public addGeojsonLayer(data: GeoJSON.GeoJsonObject) {
		if (this.ActiveMap) {
			this.ActiveMap.addGeojsonLayer(data);
		}
	}

	public setCenter(center: GeoJSON.Point, animation ?: boolean) {
		if (this.ActiveMap) {
			const animate = (_.isNil(animation)) ? true : animation;
			this.ActiveMap.setCenter(center, animate);
		}
	}

	public setPosition(position: MapPosition) {
		if (this.ActiveMap) {
			this.ActiveMap.setPosition(position);
		}
	}

	public getPlugin(pluginName: string): IMapPlugin {
		const existingPlugins = this._manager.getPlugins();
		let pluginResult: IMapPlugin = existingPlugins.find((plugin: IMapPlugin) => plugin.pluginType === pluginName);
		return pluginResult;
	}

	public setLayer(layer: any, extent?: Extent) {
		if (this.ActiveMap) {
			this.ActiveMap.setLayer(layer, extent);
		}
	}

	public addLayer(layer: any) {
		if (this.ActiveMap) {
			this.ActiveMap.addLayer(layer);
		}
	}

	public removeLayer(layer: any) {
		if (this.ActiveMap) {
			this.ActiveMap.removeLayer(layer);
		}
	}

    public addVectorLayer(layer: any): void {
		if (this.ActiveMap) {
			this.ActiveMap.addVectorLayer(layer);
		}
	}

	public removeVectorLayer(layer: any): void {
		if (this.ActiveMap) {
			this.ActiveMap.removeVectorLayer(layer);
		}
	}
	//CommunicatorEntity methods end

	//======shadow mouse start
	public toggleMouseShadowListener(){
		this.ActiveMap.togglePointerMove();
	}

	public startMouseShadowVectorLayer(){
		(<any>this.ActiveMap).startMouseShadowVectorLayer();	
	}

	public stopMouseShadowVectorLayer(){
		(<any>this.ActiveMap).stopMouseShadowVectorLayer();	
	}

	public drawShadowMouse(latLon){
		(<any>this.ActiveMap).drawShadowMouse(latLon);
	}
	//======shadow mouse end
}
