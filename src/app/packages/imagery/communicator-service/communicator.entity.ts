import { EventEmitter } from '@angular/core';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

import * as _ from 'lodash';
import { IMapPlugin } from '../model/imap-plugin';
import { Extent } from '../model/extent';
import { IMap } from '../model/imap';
import { MapPosition } from '../model/map-position';

/**
 * Created by AsafMasa on 27/04/2017.
 */

export class CommunicatorEntity {
	private _manager: ImageryComponentManager;
	private _managerSubscriptions;

	public positionChanged: EventEmitter<{id: string, position: MapPosition}>;
	public centerChanged: EventEmitter<GeoJSON.Point>;

	constructor(private _id: string) {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<{id: string, position: MapPosition}>();
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));
		this._managerSubscriptions.push(this._manager.positionChanged.subscribe((position: MapPosition ) => {
			this.positionChanged.emit({id: this._id, position});
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
	}
	public setActiveMap(mapType: string) {
		this._manager.setActiveMap(mapType);
	}

	public getActiveMap(): IMap {
		if (this._manager)
		{
			return this._manager.getActiveMap();
		}

		return null;
	}

	public getCenter(): GeoJSON.Point {
		const map = this.getActiveMap();
		if (map) {
			return map.getCenter();
		}
		return null;
	}
	public updateSize(): void {
		const map = this.getActiveMap();
		if (map) {
			return map.updateSize();
		}
	}
	public addGeojsonLayer(data: GeoJSON.GeoJsonObject) {
		const map = this.getActiveMap();
		if (map) {
			map.addGeojsonLayer(data);
		}
	}

	public setCenter(center: GeoJSON.Point, animation ?: boolean) {
		const map = this.getActiveMap();
		if (map) {
			const animate = (_.isNil(animation)) ? true : animation;
			map.setCenter(center, animate);
		}
	}

	public setPosition(position: MapPosition) {
		const map = this.getActiveMap();
		if (map) {
			map.setPosition(position);
		}
	}

	public getPlugin(pluginName: string): IMapPlugin {
		const existingPlugins = this._manager.getPlugins();
		let pluginResult: IMapPlugin = existingPlugins.find((plugin: IMapPlugin) => plugin.pluginType === pluginName);
		return pluginResult;
	}

	public setLayer(layer: any, extent?: Extent) {
		const map = this.getActiveMap();
		if (map) {
			map.setLayer(layer, extent);
		}
	}

	public addLayer(layer: any) {
		const map = this.getActiveMap();
		if (map) {
			map.addLayer(layer);
		}
	}

	public removeLayer(layer: any) {
		const map = this.getActiveMap();
		if (map) {
			map.removeLayer(layer);
		}
	}

    public addVectorLayer(layer: any): void {
		const map = this.getActiveMap();
		if (map) {
			map.addVectorLayer(layer);
		}
	}

	public removeVectorLayer(layer: any): void {
		const map = this.getActiveMap();
		if (map) {
			map.removeVectorLayer(layer);
		}
	}

	//CommunicatorEntity methods end
}
