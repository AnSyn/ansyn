import { IImageryConfig, IMapConfig } from '../../model/iimagery-config';
import { IMap } from '../../model/imap';
import { IMapComponent } from '../../model/imap-component';
import { IMapPlugin } from '../../model/imap-plugin';
import { BaseMapSourceProvider } from '../../model/base-source-provider.model';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { ImageryProviderService, IProvidedMap } from '../../provider-service/provider.service';
import { MapPosition } from '../../model/map-position';
import { IMapVisualizer } from '../../model/imap-visualizer';


export class ImageryComponentManager {

	private _activeMap: IMap;
	private _subscriptions = [];
	public centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	public positionChanged: EventEmitter<MapPosition> = new EventEmitter<MapPosition>();
	public mapComponentInitilaized: EventEmitter<any> = new EventEmitter<any>();
	public singleClick: EventEmitter<any> = new EventEmitter<any>();
	public contextMenu: EventEmitter<any> = new EventEmitter<any>();
	public mapInstanceChanged: EventEmitter<{ id: string, oldMapInstanceName: string, newMapInstanceName: string }>;

	public activeMapName: string;
	private _plugins: IMapPlugin[] = [];
	private _visualizers: IMapVisualizer[] = [];

	constructor(private imageryProviderService: ImageryProviderService,
				private componentFactoryResolver: ComponentFactoryResolver,
				private mapComponentElem: ViewContainerRef,
				private _mapComponentRef: ComponentRef<any>,
				private _baseSourceProviders: BaseMapSourceProvider[],
				private config: IImageryConfig,
				private _id: string) {
		this.mapInstanceChanged = new EventEmitter<{ id: string, oldMapInstanceName: string, newMapInstanceName: string }>();
	}

	public loadInitialMapSource(extent?: GeoJSON.Point[]) {
		if (this._activeMap) {
			this.createMapSourceForMapType(this._activeMap.mapType).then((layers) => {
				this.resetView(layers[0], extent);
				if (layers.length > 0) {
					for (let i = 1; i < layers.length; i++) {
						this._activeMap.addLayer(layers[i]);
					}
				}
			});
		}
	}

	public resetView(layer: any, extent?: GeoJSON.Point[]) {
		if (this._activeMap) {
			this._activeMap.resetView(layer, extent);
			this.resetVisualizers();
		}
	}

	private resetVisualizers() {
		this.visualizers.forEach((visualizer) => {
			visualizer.onResetView();
		});
	}

	private createMapSourceForMapType(mapType: string): Promise<any> {
		let releventMapConfig: IMapConfig = null;
		this.config.geoMapsInitialMapSource.forEach((mapConfig) => {
			if (mapConfig.mapType === mapType) {
				releventMapConfig = mapConfig;
			}
		});
		if (!releventMapConfig) {
			throw new Error(`getMapSourceForMapType failed, no config found for ${mapType}`);
		}
		const sourceProvider = this._baseSourceProviders.find((item) => item.mapType === releventMapConfig.mapType && item.sourceType === releventMapConfig.mapSource);
		return sourceProvider.createAsync(releventMapConfig.mapSourceMetadata);
	}

	private buildCurrentComponent(activeMapName: string, oldMapName: string, position?: MapPosition, layer?: any): void {
		const providedMap: IProvidedMap = this.imageryProviderService.provideMap(activeMapName);
		const factory = this.componentFactoryResolver.resolveComponentFactory(providedMap.mapComponent);

		this._mapComponentRef = this.mapComponentElem.createComponent(factory);

		const mapComponent: IMapComponent = this._mapComponentRef.instance;
		const mapCreatedSubscribe = mapComponent.mapCreated.subscribe((map: IMap) => {
			this.internalSetActiveMap(map);
			this.buildActiveMapPlugins(activeMapName);
			this.buildActiveMapVisualizers(activeMapName, map);
			this.mapComponentInitilaized.emit(this.id);
			this.mapInstanceChanged.emit({
				id: this.id,
				newMapInstanceName: activeMapName,
				oldMapInstanceName: oldMapName
			});
			mapCreatedSubscribe.unsubscribe();
		});
		if (layer) {
			mapComponent.createMap([layer], position);
		} else {
			this.createMapSourceForMapType(providedMap.mapType).then((layers) => {
				mapComponent.createMap(layers, position);
			});
		}
	}

	private destroyCurrentComponent(): void {
		this.destroyActiveMapVisualizers();
		this.destroyActiveMapPlugins();
		if (this._mapComponentRef) {
			this._mapComponentRef.destroy();
			this._mapComponentRef = undefined;
		}
	}

	public setActiveMap(activeMapName: string, position?: MapPosition, layer?: any) {
		if (this.activeMapName !== activeMapName) {
			const oldMapName = this.activeMapName;
			// console.log(`Set active map to : ${activeMapName}`);
			this.activeMapName = activeMapName;
			if (this._mapComponentRef) {
				this.destroyCurrentComponent();
			}
			this.buildCurrentComponent(activeMapName, oldMapName, position, layer);
		}
		return this.mapComponentInitilaized;
	}

	private buildActiveMapPlugins(activeMapType: string) {
		// Create Map plugin's

		const mapPlugins: IMapPlugin[] = this.imageryProviderService.createPlugins(activeMapType);
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

	public get plugins() {
		return this._plugins;
	}

	private buildActiveMapVisualizers(activeMapType: string, map: IMap) {
		// Create Map visualizer's

		const mapVisualizersConfig: [{ visualizerClass: any, args: any }] = this.imageryProviderService.getVisualizersConfig(activeMapType);
		if (!mapVisualizersConfig) {
			this._visualizers = [];
			return;
		}

		const mapVisualizers: IMapVisualizer[] = this.createVisualizers(mapVisualizersConfig, map);
		if (mapVisualizers) {
			this._visualizers = mapVisualizers;
		} else {
			this._visualizers = [];
		}
	}

	public createVisualizers(existingVisualizersConfig: [{ visualizerClass: any, args: any }], map: IMap): IMapVisualizer[] {
		const visualizers: IMapVisualizer[] = [];

		existingVisualizersConfig.forEach(provider => {
			const providedVisualizers: IMapVisualizer = new provider.visualizerClass(provider.args);
			providedVisualizers.onInit(this._id, map);
			visualizers.push(providedVisualizers);
		});

		return visualizers;
	}

	private destroyActiveMapVisualizers() {
		if (this._visualizers) {
			this._visualizers.forEach((visualizer: IMapVisualizer) => {
				visualizer.dispose();
			});
		}
		this._visualizers = [];
	}

	public get visualizers() {
		return this._visualizers;
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

		this._subscriptions.push(this._activeMap.singleClick.subscribe((event: Array<any>) => {
			this.singleClick.emit(event);
		}));

		this._subscriptions.push(this._activeMap.contextMenu.subscribe((event: Array<any>) => {
			this.contextMenu.emit(event);
		}));

	}

	public get id(): string {
		return this._id;
	}

	public set id(value: string) {
		this._id = value;
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
