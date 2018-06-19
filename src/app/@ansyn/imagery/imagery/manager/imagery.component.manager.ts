import { IImageryConfig, IMapConfig } from '@ansyn/imagery/model/iimagery-config';
import { IMap } from '@ansyn/imagery/model/imap';
import { ImageryMapComponent } from '@ansyn/imagery/model/imagery-map-component';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { ImageryProviderService, IProvidedMap } from '@ansyn/imagery/provider-service/imagery-provider.service';
import { CaseMapExtent, CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { Observable } from 'rxjs';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

export interface MapInstanceChanged {
	id: string;
	newMapInstanceName: string;
	oldMapInstanceName: string;
}

export class ImageryComponentManager {

	private _activeMap: IMap;
	private _subscriptions = [];
	public positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
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
			return this._activeMap.resetView(layer, position, extent).pipe(mergeMap(() => this.resetPlugins()));
		}

		return of(true);
	}

	private resetPlugins(): Observable<boolean> {
		const resetObservables = this.plugins.map((plugin) => plugin.onResetView());
		return forkJoin(resetObservables).pipe(map(results => results.every(b => b === true)));
	}

	private createMapSourceForMapType(mapType: string): Promise<any> {
		const relevantMapConfig: IMapConfig = this.config.geoMapsInitialMapSource.find((mapConfig) => mapConfig.mapType === mapType);
		if (!relevantMapConfig) {
			throw new Error(`getMapSourceForMapType failed, no config found for ${mapType}`);
		}
		const sourceProvider = this.getMapSourceProvider({mapType: relevantMapConfig.mapType, sourceType: relevantMapConfig.mapSource});
		return sourceProvider.createAsync(relevantMapConfig.mapSourceMetadata);
	}

	getMapSourceProvider({ mapType, sourceType }): BaseMapSourceProvider {
		return this._baseSourceProviders.find((baseSourceProvider: BaseMapSourceProvider) => {
			const source = baseSourceProvider.sourceType === sourceType;
			const supported = baseSourceProvider.supported.includes(mapType);
			return source && supported;
		});
	}

	private buildCurrentComponent(activeMapName: string, oldMapName: string, position?: CaseMapPosition, layer?: any): Promise<any> {
		const providedMap: IProvidedMap = this.imageryProviderService.provideMap(activeMapName);
		const factory = this.componentFactoryResolver.resolveComponentFactory<ImageryMapComponent>(providedMap.mapComponent);
		this._mapComponentRef = this.mapComponentElem.createComponent<ImageryMapComponent>(factory);
		const mapComponent = this._mapComponentRef.instance;
		const getLayers = layer ? Promise.resolve([layer]) : this.createMapSourceForMapType(providedMap.mapType);
		return getLayers.then((layers) => {
			return mapComponent.createMap(layers, position)
				.pipe(
					tap((map) => this.onMapCreated(map, activeMapName, oldMapName)),
				)
				.toPromise()

		});
	}

	private onMapCreated (map: IMap, activeMapName, oldMapName) {
		this.internalSetActiveMap(map);
		if (activeMapName !== oldMapName && Boolean(oldMapName)) {
			this.mapInstanceChanged.emit({
				id: this.id,
				newMapInstanceName: activeMapName,
				oldMapInstanceName: oldMapName
			});
		}
	};

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
		this.plugins.forEach((plugin) => plugin.dispose());
	}

	private internalSetActiveMap(activeMap: IMap) {
		this._activeMap = activeMap;
		this.registerToActiveMapEvents();
	}

	private registerToActiveMapEvents() {
		this._subscriptions.push(this._activeMap.positionChanged.subscribe((position: CaseMapPosition) => {
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
		this.destroyPlugins();
	}
}
