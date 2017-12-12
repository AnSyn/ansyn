import { EventEmitter } from '@angular/core';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

import * as _ from 'lodash';
import { IMapPlugin } from '../model/imap-plugin';
import { CaseMapPosition } from '@ansyn/core';
import { IMapVisualizer } from '../model/imap-visualizer';
import { IMap } from '../model/imap';
import { Observable } from 'rxjs/Observable';


export class CommunicatorEntity {
	private _managerSubscriptions;


	public positionChanged: EventEmitter<{ id: string, position: CaseMapPosition }>;
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public singleClick: EventEmitter<any>;
	public contextMenu: EventEmitter<any>;
	public mapInstanceChanged: EventEmitter<{ id: string, oldMapInstanceName: string, newMapInstanceName: string }>;

	constructor(public _manager: ImageryComponentManager) {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<{ id: string, position: CaseMapPosition }>();
		this.singleClick = new EventEmitter<any>();
		this.contextMenu = new EventEmitter<any>();
		this.mapInstanceChanged = new EventEmitter<{ id: string, oldMapInstanceName: string, newMapInstanceName: string }>();

		this._managerSubscriptions = [];
		this.registerToManagerEvents();
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));

		this._managerSubscriptions.push(this._manager.positionChanged.subscribe((position: CaseMapPosition) => {
			this.positionChanged.emit({ id: this._manager.id, position });
		}));

		this._managerSubscriptions.push(this._manager.singleClick.subscribe((event: any) => {
			this.singleClick.emit(event);
		}));

		this._managerSubscriptions.push(this._manager.contextMenu.subscribe((event: any) => {
			this.contextMenu.emit(event);
		}));

		this._managerSubscriptions.push(this._manager.mapInstanceChanged.subscribe((event: any) => {
			this.mapInstanceChanged.emit(event);
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

	// CommunicatorEntity methods begin

	public setActiveMap(mapName: string, position?: CaseMapPosition, layer?: any) {
		this._manager.setActiveMap(mapName, position, layer);
	}

	public get activeMapName(): string {
		if (this._manager) {
			return this._manager.activeMapName;
		}
		return '';
	}

	public loadInitialMapSource(extent?: GeoJSON.Point[]) {
		this._manager.loadInitialMapSource(extent);
	}

	public get ActiveMap(): IMap {
		if (this._manager) {
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

	public setPosition(position: CaseMapPosition) {
		if (!this.ActiveMap) {
			throw new Error('missing active map');
		}
		this.ActiveMap.setPosition(position);
	}

	public getPosition(): CaseMapPosition {
		if (!this.ActiveMap) {
			throw new Error('missing active map');
		}
		return this.ActiveMap.getPosition();
	}

	public setRotation(rotation: number) {
		if (!this.ActiveMap) {
			throw new Error('missing active map');
		}
		this.ActiveMap.setRotation(rotation);
	}

	public getPlugin(pluginName: string): IMapPlugin {
		return this._manager.plugins.find((plugin: IMapPlugin) => plugin.pluginType === pluginName);
	}

	public getVisualizer(visualizerType: string): IMapVisualizer {
		return this._manager.visualizers.find((visualizer: IMapVisualizer) => visualizer.type === visualizerType);
	}

	public getAllVisualizers() {
		return this._manager.visualizers;
	}

	public resetView(layer: any, extent?: GeoJSON.Point[]) {
		if (this._manager) {
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

	public setAutoImageProcessing(shouldPerform: boolean): void {
		if (this.ActiveMap) {
			this.ActiveMap.setAutoImageProcessing(shouldPerform);
		}
	}

	public setManualImageProcessing(processingParams: Object): void {
		if (this.ActiveMap) {
			this.ActiveMap.setManualImageProcessing(processingParams);
		}
	}

	// CommunicatorEntity methods end

	// ======shadow mouse start
	public setMouseShadowListener(enable: boolean): Observable<any> {
		this.ActiveMap.setPointerMove(enable);
		return this.ActiveMap.getPointerMove();
	}

	// ======shadow mouse end

	// ====== treat map click event (used for pinPointIndicator)
	public createMapSingleClickEvent() {
		(<any>this.ActiveMap).addSingleClickEvent();
	}

	public removeSingleClickEvent() {
		(<any>this.ActiveMap).removeSingleClickEvent();
	}

	// ======end treat map click event (used for pinPointIndicator)
}
