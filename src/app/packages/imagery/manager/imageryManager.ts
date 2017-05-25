import { IImageryConfig, IMap, IMapComponent, IMapConfig } from '../model/model';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { ImageryProviderService } from '../imageryProviderService/imageryProvider.service';
import { Position } from '@ansyn/core';
import {
	MapSourceProviderContainerService
} from '@ansyn/map-source-provider';
/**
 * Created by AsafMasa on 27/04/2017.
 */
export class ImageryManager {
	private _activeMap: IMap;
	private _subscriptions = [];

	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<Position>;

	constructor(public id: string,
				private imageryProviderService: ImageryProviderService,
				private componentFactoryResolver: ComponentFactoryResolver,
				private map_component_elem: ViewContainerRef,
				private _mapComponentRef: ComponentRef<any>,
				private mapSourceProviderContainerService: MapSourceProviderContainerService,
				private config: IImageryConfig) {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<Position>();
	}

	private buildCurrentComponent(activeMapType: string): void {
		const component = this.imageryProviderService.provideMap(activeMapType);
		const factory = this.componentFactoryResolver.resolveComponentFactory(component);

		this._mapComponentRef = this.map_component_elem.createComponent(factory);

		const mapComponent: IMapComponent = this._mapComponentRef.instance;
		const mapCreatedSubscribe = mapComponent.mapCreated.subscribe((map: IMap) => {
			this.internalSetActiveMap(map);
			mapCreatedSubscribe.unsubscribe();
		});
		let releventMapConfig: IMapConfig = null;
		this.config.geoMapsInitialMapSource.forEach((mapConfig)=>{
			if (mapConfig.mapType === activeMapType) {
				releventMapConfig = mapConfig;
			}
		});
		if (!releventMapConfig) {
			throw new Error(`no config found for ${activeMapType}`);
		}

		const sourceProvider = this.mapSourceProviderContainerService.resolve(releventMapConfig.mapType, releventMapConfig.mapSource);
		sourceProvider.createAsync(releventMapConfig.mapSourceMetadata).then((layers)=>{
			mapComponent.createMap(layers);
		});
	}

	private destroyCurrentComponent(): void {
		if (this._mapComponentRef) {
			this._mapComponentRef.destroy();
			this._mapComponentRef = undefined;
		}
	}

	public setActiveMap(activeMapType: string) {
		// console.log(`'${this.id} setActiveMap ${activeMapType} map'`);
		if (this._mapComponentRef) {
			this.destroyCurrentComponent();
		}
		this.buildCurrentComponent(activeMapType);
	}

	private internalSetActiveMap(activeMap: IMap) {
		// console.log(`'${this.id} setActiveMap ${activeMap.mapType} map'`);
		this._activeMap = activeMap;
		this.registerToActiveMapEvents();
	}

	public setBoundingView(boundingRectangle: GeoJSON.MultiPolygon) {
		console.debug("TODO: implement setBoundingView");
	}

	public setCenter(center: GeoJSON.Point, animation: boolean) {
		this._activeMap.setCenter(center, animation);
	}

	public setPosition(position: Position) {
		this._activeMap.setPosition(position);
	}

	public getPosition(): void {
		this._activeMap.getPosition();
	}

	public updateSize(): void {
		this._activeMap.updateSize();
	}

	addGeojsonLayer(data: GeoJSON.GeoJsonObject): void{
		this._activeMap.addGeojsonLayer(data);
	}

	public getMapObject() {
		return this._activeMap;
	}

	// private registerMapCommunicatorEvents() {
	// 	this._subscriptions.push(this._mapCommunicator.mapBoundingRectangleChanged.subscribe((boundingRectangle: GeoJSON.MultiPolygon) => {
	// 		this._activeMap.setBoundingRectangle(boundingRectangle);
	// 	}));
	//
	// 	this._subscriptions.push(this._mapCommunicator.mapCenterChanged.subscribe((setCenter: GeoJSON.Point) => {
	// 		this._activeMap.setCenter(setCenter);
	// 	}));
	// }
	//

	private registerToActiveMapEvents() {
		this._subscriptions.push(this._activeMap.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));
		this._subscriptions.push(this._activeMap.positionChanged.subscribe((position: Position) => {
			this.positionChanged.emit(position);
		}));
	}

	getMapCenter(): GeoJSON.Point {
		return this._activeMap.getCenter();
	}

	public dispose() {
		for (let i = 0; i < this._subscriptions.length; i++) {
			this._subscriptions[i].unsubscribe();
		}
		this._subscriptions = [];
	}

	public setLayer(layer: any) {
		this._activeMap.setLayer(layer);
	}

	public addLayer(layer: any) {
		this._activeMap.addLayer(layer);
	}

	public addVectorLayer(layer: any): void {
		this._activeMap.addVectorLayer(layer);
	}

	public removeVectorLayer(layer: any): void {
		this._activeMap.removeVectorLayer(layer);
	}
}
