import { IImageryConfig, IMapConfig } from '../../model/iimagery-config';
import { IMap } from '../../model/imap';
import { IMapComponent } from '../../model/imap-component';
import { IMapPlugin } from '../../model/imap-plugin';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { ImageryProviderService } from '../../provider-service/provider.service';
import { MapSourceProviderContainerService } from '@ansyn/map-source-provider';
import { ImageryComponentSettings } from '../../model/imagery-component-settings';
import { CommunicatorEntity } from '../../communicator-service/communicator.entity';
import { MapPosition } from '../../model/map-position';
/**
 * Created by AsafMasa on 27/04/2017.
 */
export class ImageryComponentManager {
	private _activeMap: IMap;
	private _subscriptions = [];

	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<MapPosition>;
	private _plugins: IMapPlugin[];

	constructor(public id: string,
				private imageryProviderService: ImageryProviderService,
				private componentFactoryResolver: ComponentFactoryResolver,
				private map_component_elem: ViewContainerRef,
				private _mapComponentRef: ComponentRef<any>,
				private mapSourceProviderContainerService: MapSourceProviderContainerService,
				private config: IImageryConfig,
				private imageryCommunicator: CommunicatorEntity) {
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this._plugins = [];
	}

	private buildCurrentComponent(activeMapType: string, position?: MapPosition): void {
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
			mapComponent.createMap(layers, position);
		});
	}

	private destroyCurrentComponent(): void {
		if (this._mapComponentRef) {
			this._mapComponentRef.destroy();
			this._mapComponentRef = undefined;
		}
	}

	public setActiveMap(activeMapType: string, position?: MapPosition) {
		// console.log(`'${this.id} setActiveMap ${mapType} map'`);
		if (this._mapComponentRef) {
			this.destroyCurrentComponent();
			this.destroyActiveMapPlugins();
		}
		this.buildCurrentComponent(activeMapType, position);
		this.buildActiveMapPlugins(activeMapType);
	}

	private buildActiveMapPlugins(activeMapType: string) {
		// Create Map plugin's

		const mapPlugins: IMapPlugin[] = this.imageryProviderService.createPlugins(activeMapType, this.imageryCommunicator);
		if (mapPlugins) {
			this._plugins = mapPlugins;
		} else {
			this._plugins = [];
		}
	}

	private destroyActiveMapPlugins() {
		if (this._plugins) {
			this._plugins.forEach((plugin: IMapPlugin) => {
				plugin.dispose();
			});
		}
		this._plugins = [];
	}

	public getPlugins() {
		return this._plugins;
	}

	private internalSetActiveMap(activeMap: IMap) {
		this._activeMap = activeMap;
		this.registerToActiveMapEvents();
	}

	private registerToActiveMapEvents() {
		this._subscriptions.push(this._activeMap.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));
		this._subscriptions.push(this._activeMap.positionChanged.subscribe((position: MapPosition) => {
			this.positionChanged.emit(position);
		}));
	}

	public get ActiveMap(): IMap {
		return this._activeMap;
	}

	public dispose() {
		for (let i = 0; i < this._subscriptions.length; i++) {
			this._subscriptions[i].unsubscribe();
		}
		this._subscriptions = [];
	}
}
