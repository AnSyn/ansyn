import { IImageryConfig, IMapConfig } from '../../model/iimagery-config';
import { IMap } from '../../model/imap';
import { ImageryMapComponent } from '../../model/imagery-map-component';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { BaseMapSourceProvider } from '../../model/base-source-provider.model';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { ImageryProviderService, IProvidedMap } from '../../provider-service/imagery-provider.service';
import { CaseMapPosition } from '@ansyn/core';
import { CaseMapExtent } from '@ansyn/core/models/case-map-position.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/fromPromise';
import { ImageryCommunicatorService } from '@ansyn/imagery';

export interface MapInstanceChanged {
	id: string;
	newMapInstanceName: string;
	oldMapInstanceName: string;
}

export class ImageryComponentManager {

	private _activeMap: IMap;
	private _subscriptions = [];
	public centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	public positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	public singleClick: EventEmitter<any> = new EventEmitter<any>();
	public contextMenu: EventEmitter<any> = new EventEmitter<any>();
	public mapInstanceChanged: EventEmitter<MapInstanceChanged> = new EventEmitter<MapInstanceChanged>();
	public activeMapName: string;

	public get id(): string {
		return this._id;
	}

	public get plugins(): BaseImageryPlugin[] {
		return this._mapComponentRef.instance.plugins;
	}

	constructor(protected imageryProviderService: ImageryProviderService,
				protected componentFactoryResolver: ComponentFactoryResolver,
				public imageryCommunicatorService: ImageryCommunicatorService,
				protected mapComponentElem: ViewContainerRef,
				protected _mapComponentRef: ComponentRef<ImageryMapComponent>,
				protected _baseSourceProviders: BaseMapSourceProvider[],
				protected config: IImageryConfig,
				protected _id: string
	) {
	}

	public loadInitialMapSource(position?: CaseMapPosition): Promise <any> {
		return new Promise(resolve => {
			if (!this._activeMap) {
				resolve();
			}


			this.createMapSourceForMapType(this._activeMap.mapType).then((layers) => {
				this.resetView(layers[0], position).subscribe(() => {
					if (layers.length > 0) {
						for (let i = 1; i < layers.length; i++) {
							this._activeMap.addLayer(layers[i]);
						}
					}

					resolve(layers);
				});
			});
		});
	}

	public resetView(layer: any, position: CaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		if (this._activeMap) {
			return this._activeMap.resetView(layer, position, extent).switchMap(() => this.resetPlugins());
		}

		return Observable.of(true);
	}

	private resetPlugins(): Observable<boolean> {
		let resetObservables = [];

		this.plugins.forEach((plugin: BaseImageryPlugin) => {
			resetObservables.push(plugin.onResetView());
		});

		return Observable.forkJoin(resetObservables).map(results => results.every(b => b === true));
	}

	private createMapSourceForMapType(mapType: string): Promise<any> {
		let relevantMapConfig: IMapConfig = null;
		this.config.geoMapsInitialMapSource.forEach((mapConfig) => {
			if (mapConfig.mapType === mapType) {
				relevantMapConfig = mapConfig;
			}
		});
		if (!relevantMapConfig) {
			throw new Error(`getMapSourceForMapType failed, no config found for ${mapType}`);
		}
		const sourceProvider = this._baseSourceProviders.find((item) => item.mapType === relevantMapConfig.mapType && item.sourceType === relevantMapConfig.mapSource);
		return sourceProvider.createAsync(relevantMapConfig.mapSourceMetadata, this.id);
	}

	private buildCurrentComponent(activeMapName: string, oldMapName: string, position?: CaseMapPosition, layer?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const providedMap: IProvidedMap = this.imageryProviderService.provideMap(activeMapName);
			const factory = this.componentFactoryResolver.resolveComponentFactory<ImageryMapComponent>(providedMap.mapComponent);
			this._mapComponentRef = this.mapComponentElem.createComponent<ImageryMapComponent>(factory);
			const mapComponent = this._mapComponentRef.instance;
			const mapCreatedSubscribe = mapComponent.mapCreated.subscribe((map: IMap) => {
				this.internalSetActiveMap(map);
				if (activeMapName !== oldMapName && Boolean(oldMapName)) {
					this.mapInstanceChanged.emit({
						id: this.id,
						newMapInstanceName: activeMapName,
						oldMapInstanceName: oldMapName
					});
				}
				mapCreatedSubscribe.unsubscribe();
				resolve();
			});
			if (layer) {
				mapComponent.createMap([layer], position);
			} else {
				return this.createMapSourceForMapType(providedMap.mapType).then((layers) => {
					mapComponent.createMap(layers, position);
				});
			}
		});
	}

	private destroyCurrentComponent(): void {
		this.destroyPlugins();
		if (this._mapComponentRef) {
			this._mapComponentRef.destroy();
			this._mapComponentRef = undefined;
		}
	}

	public setActiveMap(activeMapName: string, position?: CaseMapPosition, layer?: any): Promise<any> {

		if (this.activeMapName !== activeMapName) {
			const oldMapName = this.activeMapName;
			// console.log(`Set active map to : ${activeMapName}`);
			this.activeMapName = activeMapName;
			if (this._mapComponentRef) {
				this.destroyCurrentComponent();
			}
			return this.buildCurrentComponent(activeMapName, oldMapName, position, layer);
		}
		return Promise.resolve();
	}

	destroyPlugins() {
		this.plugins.forEach((plugin: BaseImageryPlugin) => {
			plugin.dispose();
		});
	}

	private internalSetActiveMap(activeMap: IMap) {
		this._activeMap = activeMap;
		this.registerToActiveMapEvents();
	}

	private registerToActiveMapEvents() {

		this._subscriptions.push(this._activeMap.centerChanged.subscribe((center: GeoJSON.Point) => {
			this.centerChanged.emit(center);
		}));

		this._subscriptions.push(this._activeMap.positionChanged.subscribe((position: CaseMapPosition) => {
			this.positionChanged.emit(position);
		}));

		this._subscriptions.push(this._activeMap.singleClick.subscribe((event: Array<any>) => {
			this.singleClick.emit(event);
		}));

		this._subscriptions.push(this._activeMap.contextMenu.subscribe((event: Array<any>) => {
			this.contextMenu.emit(event);
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
		this.destroyPlugins();
	}
}
