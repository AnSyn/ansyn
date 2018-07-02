import { BaseImageryMap } from '../../model/base-imagery-map';
import { BaseMapSourceProvider, BaseMapSourceProviderConstructor } from '../../model/base-map-source-provider';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, ViewContainerRef } from '@angular/core';
import { BaseImageryMapConstructor } from '../../model/base-imagery-map';
import { CaseMapExtent, CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ImageryCommunicatorService } from '../../communicator-service/communicator.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { BaseImageryPluginProvider } from '../providers/imagery.providers';
import { MapComponent } from '../../map/map.component';

export interface MapInstanceChanged {
	id: string;
	newMapInstanceName: string;
	oldMapInstanceName: string;
}

export class ImageryComponentManager {

	private _activeMap: BaseImageryMap;
	private _subscriptions = [];
	public positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	public mapInstanceChanged: EventEmitter<MapInstanceChanged> = new EventEmitter<MapInstanceChanged>();
	public activeMapName: string;

	public get id(): string {
		return this.mapSettings.id;
	}

	public get plugins(): BaseImageryPlugin[] {
		return this._mapComponentRef.instance.plugins;
	}

	constructor(protected injector: Injector,
				protected iMapConstructors: BaseImageryMapConstructor[],
				protected componentFactoryResolver: ComponentFactoryResolver,
				public imageryCommunicatorService: ImageryCommunicatorService,
				protected mapComponentElem: ViewContainerRef,
				protected _mapComponentRef: ComponentRef<MapComponent>,
				protected _baseSourceProviders: BaseMapSourceProvider[],
				protected mapSettings: CaseMapState) {
	}

	public loadInitialMapSource(position?: CaseMapPosition): Promise<any> {
		return new Promise(resolve => {
			if (!this._activeMap) {
				resolve();
			}


			this.createMapSourceForMapType((<BaseImageryMapConstructor>this._activeMap.constructor).mapType).then((layers) => {
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
		const sourceProvider = this.getMapSourceProvider({ mapType, sourceType: this.mapSettings.sourceType });
		return sourceProvider.createAsync(this.mapSettings);
	}

	getMapSourceProvider({ mapType, sourceType }): BaseMapSourceProvider {
		return this._baseSourceProviders
			.find((baseSourceProvider: BaseMapSourceProvider ) => {
				const baseConstructor = <BaseMapSourceProviderConstructor> baseSourceProvider.constructor;
				const source = baseConstructor.sourceType === sourceType;
				const supported = baseConstructor.supported.some((imageryMapConstructor: BaseImageryMapConstructor) => imageryMapConstructor.mapType === mapType);
				return source && supported;
		});
	}

	private buildCurrentComponent(activeMapName: string, oldMapName: string, position?: CaseMapPosition, layer?: any): Promise<any> {
		const imapClass = this.iMapConstructors.find((imap: BaseImageryMapConstructor) => imap.mapType === activeMapName);
		const factory = this.componentFactoryResolver.resolveComponentFactory<MapComponent>(MapComponent);
		const providers = [
			{
				provide: BaseImageryMap,
				useClass: imapClass,
				deps: imapClass.deps || []
			},
			BaseImageryPluginProvider];

		const injector = Injector.create({ parent: this.injector, providers });
		this._mapComponentRef = this.mapComponentElem.createComponent<MapComponent>(factory, undefined, injector);
		const mapComponent = this._mapComponentRef.instance;
		const getLayers = layer ? Promise.resolve([layer]) : this.createMapSourceForMapType(imapClass.mapType);
		return getLayers.then((layers) => {
			return mapComponent.createMap(layers, position)
				.pipe(
					tap((map) => this.onMapCreated(map, activeMapName, oldMapName))
				)
				.toPromise();

		});
	}

	private onMapCreated(map: BaseImageryMap, activeMapName, oldMapName) {
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

	private internalSetActiveMap(activeMap: BaseImageryMap) {
		this._activeMap = activeMap;
		this.registerToActiveMapEvents();
	}

	private registerToActiveMapEvents() {
		this._subscriptions.push(this._activeMap.positionChanged.subscribe((position: CaseMapPosition) => {
			this.positionChanged.emit(position);
		}));
	}

	public get ActiveMap(): BaseImageryMap {
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
