import { BaseImageryMap, IBaseImageryMapConstructor } from '../../model/base-imagery-map';
import { BaseMapSourceProvider, IBaseMapSourceProviderConstructor } from '../../model/base-map-source-provider';
import { ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, ViewContainerRef } from '@angular/core';
import { CaseMapExtent, ICaseMapPosition, ICaseMapState } from '@ansyn/core';
import { ImageryCommunicatorService } from '../../communicator-service/communicator.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { BaseImageryPlugin } from '../../model/base-imagery-plugin';
import { BaseImageryPluginProvider } from '../providers/imagery.providers';
import { MapComponent } from '../../map/map.component';

export interface IMapInstanceChanged {
	id: string;
	newMapInstanceName: string;
	oldMapInstanceName: string;
}

export class ImageryComponentManager {

	private _activeMap: BaseImageryMap;
	private _subscriptions = [];
	public mapInstanceChanged: EventEmitter<IMapInstanceChanged> = new EventEmitter<IMapInstanceChanged>();
	public activeMapName: string;

	public get id(): string {
		return this.mapSettings.id;
	}

	public get plugins(): BaseImageryPlugin[] {
		return this._mapComponentRef.instance.plugins;
	}

	constructor(protected injector: Injector,
				protected iMapConstructors: IBaseImageryMapConstructor[],
				protected componentFactoryResolver: ComponentFactoryResolver,
				public imageryCommunicatorService: ImageryCommunicatorService,
				protected mapComponentElem: ViewContainerRef,
				protected _mapComponentRef: ComponentRef<MapComponent>,
				protected _baseSourceProviders: BaseMapSourceProvider[],
				protected mapSettings: ICaseMapState) {
	}

	public loadInitialMapSource(position?: ICaseMapPosition): Promise<any> {
		return new Promise(resolve => {
			if (!this._activeMap) {
				resolve();
			}

			this.createMapSourceForMapType(this.mapSettings.worldView.mapType, this.mapSettings.worldView.sourceType).then((layers) => {
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

	public resetView(layer: any, position: ICaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		if (this._activeMap) {
			return this._activeMap.resetView(layer, position, extent).pipe(mergeMap(() => this.resetPlugins()));
		}

		return of(true);
	}

	private resetPlugins(): Observable<boolean> {
		const resetObservables = this.plugins.map((plugin) => plugin.onResetView());
		return forkJoin(resetObservables).pipe(map(results => results.every(b => b === true)));
	}

	private createMapSourceForMapType(mapType: string, sourceType: string): Promise<any> {
		const sourceProvider = this.getMapSourceProvider({
			mapType, sourceType
		});
		return sourceProvider.createAsync(this.mapSettings);
	}

	getMapSourceProvider({ mapType, sourceType }: { mapType?: string, sourceType: string }): BaseMapSourceProvider {
		return this._baseSourceProviders
			.find((baseSourceProvider: BaseMapSourceProvider) => {
				const baseConstructor = <IBaseMapSourceProviderConstructor> baseSourceProvider.constructor;
				const source = !sourceType ? true : baseConstructor.sourceType === sourceType;
				const supported = mapType ? baseConstructor.supported.some((imageryMapConstructor: IBaseImageryMapConstructor) => imageryMapConstructor.mapType === mapType) : true;
				return source && supported;
			});
	}

	private buildCurrentComponent(activeMapName: string, oldMapName: string, position: ICaseMapPosition, sourceType?: string, layer?: any): Promise<any> {
		const imapClass = this.iMapConstructors.find((imap: IBaseImageryMapConstructor) => imap.mapType === activeMapName);
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
		const getLayers = layer ? Promise.resolve([layer]) : this.createMapSourceForMapType(imapClass.mapType, sourceType || imapClass.defaultMapSource);
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

	public setActiveMap(activeMapName: string, position: ICaseMapPosition, sourceType?, layer?: any): Promise<any> {

		if (this.activeMapName !== activeMapName) {
			const oldMapName = this.activeMapName;
			// console.log(`Set active map to : ${activeMapName}`);
			this.activeMapName = activeMapName;
			if (this._mapComponentRef) {
				this.destroyCurrentComponent();
			}
			return this.buildCurrentComponent(activeMapName, oldMapName, position, sourceType, layer);
		}
		return Promise.resolve();
	}

	destroyPlugins() {
		this.plugins.forEach((plugin) => plugin.dispose());
	}

	private internalSetActiveMap(activeMap: BaseImageryMap) {
		this._activeMap = activeMap;
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
