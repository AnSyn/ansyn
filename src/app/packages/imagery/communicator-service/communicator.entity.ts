import { EventEmitter } from '@angular/core';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

import * as _ from 'lodash';
import { IMapPlugin } from '../model/imap-plugin';
import { IMap } from '../model/imap';
import { MapPosition } from '../model/map-position';
import { IMapVisualizer } from '../model/imap-visualizer';

/**
 * Created by AsafMasa on 27/04/2017.
 */

export class CommunicatorEntity {
	private _managerSubscriptions;


	public positionChanged: EventEmitter<{id: string, position: MapPosition}>;
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public pointerMove: EventEmitter<any>;
	public singleClick: EventEmitter<any>;
	public contextMenu: EventEmitter<any>;


	constructor(private _manager: ImageryComponentManager) {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<{id: string, position: MapPosition}>();
		this.pointerMove = new EventEmitter<any>();
		this.singleClick = new EventEmitter<any>();
		this.contextMenu = new EventEmitter<any>();

		this._managerSubscriptions = [];
		this.registerToManagerEvents();
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));

		this._managerSubscriptions.push(this._manager.positionChanged.subscribe((position: MapPosition ) => {
			this.positionChanged.emit({id: this._manager.id, position});
		}));

		this._managerSubscriptions.push(this._manager.pointerMove.subscribe((latLon: Array<any> ) => {
			this.pointerMove.emit(latLon);
		}));

		this._managerSubscriptions.push(this._manager.singleClick.subscribe((event: any) => {
			this.singleClick.emit(event);
		}));

		this._managerSubscriptions.push(this._manager.contextMenu.subscribe((event: any) => {
			this.contextMenu.emit(event);
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

	public setActiveMap(mapType: string) {
		this._manager.setActiveMap(mapType);
	}

	public loadInitialMapSource(extent?: GeoJSON.Point[]) {
		this._manager.loadInitialMapSource(extent);
	}

	public get ActiveMap() {
		if (this._manager){
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
		let pluginResult: IMapPlugin = this._manager.plugins.find((plugin: IMapPlugin) => plugin.pluginType === pluginName);
		return pluginResult;
	}

	public getVisualizer(visualizerType: string): IMapVisualizer {
		let visualizerResult: IMapVisualizer = this._manager.visualizers.find((visualizer: IMapVisualizer) => visualizer.type === visualizerType);
		return visualizerResult;
	}

	public resetView(layer: any, extent?: GeoJSON.Point[]) {
		if (this._manager){
			this._manager.resetView(layer, extent);
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

	public setAutoImageProcessing(shouldPerform: boolean): void {
		if (this.ActiveMap) {
			this.ActiveMap.setAutoImageProcessing(shouldPerform);
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

	//======pinPointIndicator
	public createMapSingleClickEvent(){
		(<any>this.ActiveMap).addSingleClickEvent();
	}

	public removeSingleClickEvent(){
		(<any>this.ActiveMap).removeSingleClickEvent();
	}

	public addPinPointIndicator(latLon:Array<number>){
		(<any>this.ActiveMap).addPinPointIndicator(latLon);
	}

	public removePinPointIndicator(){
		(<any>this.ActiveMap).removePinPointIndicator();
	}
	//======end pinPointIndicator
}
