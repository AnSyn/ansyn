import {
	ComponentFactoryResolver,
	ComponentRef,
	EventEmitter,
	Inject,
	Injectable,
	Injector,
	OnDestroy,
	OnInit,
	ViewContainerRef
} from '@angular/core';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { BaseImageryMap } from '../model/base-imagery-map';
import { forkJoin, merge, Observable, of, throwError } from 'rxjs';
import { Feature, GeoJsonObject, Point, Polygon } from 'geojson';
import { ImageryCommunicatorService } from './communicator.service';
import { BaseImageryVisualizer } from '../model/base-imagery-visualizer';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { IMAGERY_MAPS, ImageryMaps } from '../providers/imagery-map-collection';
import { BaseMapSourceProvider } from '../model/base-map-source-provider';
import { MapComponent } from '../map/map.component';
import { BaseImageryPluginProvider } from '../imagery/providers/imagery.providers';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ImageryMapSources } from '../providers/map-source-providers';
import { get as _get } from 'lodash';
import { ImageryMapExtent, ImageryMapPosition } from '../model/case-map-position.model';
import { bboxFromGeoJson, getPolygonByPointAndRadius } from '../utils/geo';
import {
	IMapProviderConfig,
	IMapProvidersConfig,
	IMapSource,
	MAP_PROVIDERS_CONFIG
} from '../model/map-providers-config';
import { IMapSettings } from '../model/map-settings';
import { IMAGERY_BASE_MAP_LAYER, ImageryLayerProperties } from '../model/imagery-layer.model';

export interface IMapInstanceChanged {
	id: string;
	newMapInstanceName: string;
	oldMapInstanceName: string;
}

@Injectable()
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class CommunicatorEntity implements OnInit, OnDestroy {
	public mapSettings: IMapSettings;
	public mapComponentElem: ViewContainerRef;
	private _mapComponentRef: ComponentRef<MapComponent>;
	private _activeMap: BaseImageryMap;
	private _virtualNorth = 0;
	public mapInstanceChanged: EventEmitter<IMapInstanceChanged> = new EventEmitter<IMapInstanceChanged>();

	constructor(protected injector: Injector,
				@Inject(IMAGERY_MAPS) protected imageryMaps: ImageryMaps,
				protected componentFactoryResolver: ComponentFactoryResolver,
				public imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(BaseMapSourceProvider) public imageryMapSources: ImageryMapSources,
				@Inject(MAP_PROVIDERS_CONFIG) protected mapProvidersConfig: IMapProvidersConfig
	) {
	}

	get plugins() {
		return _get(this._mapComponentRef, 'instance.plugins') || [];
	}

	get visualizers(): BaseImageryVisualizer[] {
		return <any>this.plugins.filter(plugin => plugin instanceof BaseImageryVisualizer);
	}

	get positionChanged() {
		return this.ActiveMap.positionChanged;
	}

	get id() {
		return _get(this.mapSettings, 'id');
	}

	public get ActiveMap(): BaseImageryMap {
		return this._activeMap;
	}

	public get activeMapName() {
		return this.ActiveMap && this.ActiveMap.mapType;
	}

	@AutoSubscription
	activeMap$ = () => merge(this.imageryCommunicatorService.instanceCreated, this.mapInstanceChanged)
		.pipe(
			filter(({ id }) => id === this.id),
			tap(this.initPlugins.bind(this))
		);

	getMapSourceProvider({ mapType, sourceType }: { mapType?: string, sourceType: string }): BaseMapSourceProvider {
		return this.imageryMapSources[mapType][sourceType];
	}

	initPlugins() {
		this.plugins.forEach((plugin) => plugin.init(this as any));
	}

	public async replaceMapMainLayer(sourceType: string): Promise<boolean> { // TODO: change all promise to observable
		const newSourceTypeLayer = await this.createMapSourceForMapType(this.ActiveMap.mapType, sourceType);
		newSourceTypeLayer.set(ImageryLayerProperties.NAME, IMAGERY_BASE_MAP_LAYER);
		if (newSourceTypeLayer) {
			this._activeMap.addMapLayer(newSourceTypeLayer);
			return true;
		}
		return false;
	}

	public setActiveMap(mapType: string, position: ImageryMapPosition, sourceType?, layer?: any): Promise<any> {
		if (this._mapComponentRef) {
			this.destroyCurrentComponent();
		}
		const imageryMap = this.imageryMaps[mapType];

		const factory = this.componentFactoryResolver.resolveComponentFactory<MapComponent>(MapComponent);
		const providers = [
			{
				provide: BaseImageryMap,
				useClass: imageryMap,
				deps: imageryMap.prototype.deps || []
			},
			BaseImageryPluginProvider];

		const injector = Injector.create({ parent: this.injector, providers });
		this._mapComponentRef = this.mapComponentElem.createComponent<MapComponent>(factory, undefined, injector);
		const mapComponent = this._mapComponentRef.instance;

		if (!layer && !sourceType) {
			const mapProviderConfig: IMapProviderConfig = this.mapProvidersConfig[imageryMap.prototype.mapType];
			sourceType = mapProviderConfig && mapProviderConfig.defaultMapSource;
			if (!sourceType) {
				console.warn(`Couldn't find defaultMapSource setting in config, for map type ${ imageryMap.prototype.mapType }`);
			}
			this.mapSettings.worldView.sourceType = sourceType;
		}

		const getLayers = layer ? Promise.resolve(layer) : this.createMapSourceForMapType(mapType, sourceType);
		return getLayers.then((layer) => {
			if (!Boolean(layer)) {
				return Promise.reject('failed to load map layer: ' + sourceType);
			}
			return mapComponent.createMap(layer, position)
				.pipe(
					tap((map) => this.onMapCreated(map, mapType, this.activeMapName))
				)
				.toPromise();
		});
	}

	loadInitialMapSource(position?: ImageryMapPosition): Promise<any> {
		return new Promise(resolve => {
			if (!this._activeMap) {
				resolve();
			}

			this.createMapSourceForMapType(this.mapSettings.worldView.mapType, this.mapSettings.worldView.sourceType)
				.then((layer) => {
					this.resetView(layer, position).subscribe(() => {
						resolve(layer);
					});
				});
		});
	}

	public getCenter(): Observable<Point> {
		if (this.ActiveMap) {
			return this.ActiveMap.getCenter();
		}
		return of(null);
	}

	public updateSize(): void {
		if (this.ActiveMap) {
			this.ActiveMap.updateSize();
		}
	}

	public addGeojsonLayer(data: GeoJsonObject) {
		if (this.ActiveMap) {
			this.ActiveMap.addGeojsonLayer(data);
		}
	}

	setVirtualNorth(north: number) {
		this._virtualNorth = north;
	}

	getVirtualNorth() {
		return this._virtualNorth;
	}

	public setCenter(center: Point, animation: boolean = true): Observable<boolean> {
		if (this.ActiveMap) {
			return this.ActiveMap.setCenter(center, animation);
		}

		return of(true);
	}

	public setPosition(position: ImageryMapPosition): Observable<boolean> {
		if (!this.ActiveMap) {
			return throwError(new Error('missing active map'));
		}

		return this.ActiveMap.setPosition(position);
	}

	public getPosition(): Observable<ImageryMapPosition> {
		if (!this.ActiveMap) {
			return throwError(new Error('missing active map'));
		}
		return this.ActiveMap.getPosition();
	}

	setPositionByRect(rect: Polygon): Observable<boolean> {
		const position: ImageryMapPosition = {
			extentPolygon: rect
		};
		return this.setPosition(position);
	}

	setPositionByRadius(center: Point, radiusInMeters: number): Observable<boolean> {
		const polygon: Feature<Polygon> = getPolygonByPointAndRadius(center.coordinates, radiusInMeters / 1000);
		const position: ImageryMapPosition = {
			extentPolygon: polygon.geometry
		};
		return this.setPosition(position);
	}

	public setRotation(rotation: number) {
		if (!this.ActiveMap) {
			throw new Error('missing active map');
		}
		this.ActiveMap.setRotation(rotation);
	}

	getRotation(): number {
		if (!this.ActiveMap) {
			throw new Error('missing active map');
		}
		return this.ActiveMap.getRotation();
	}

	public getPlugin<T extends BaseImageryPlugin>(plugin: { new(...args): T }): T {
		return <any>this.plugins.find((_plugin) => _plugin instanceof plugin);
	}

	public resetView(layer: any, position: ImageryMapPosition, extent?: ImageryMapExtent, useDoubleBuffer: boolean = false): Observable<boolean> {
		this.setVirtualNorth(0);
		if (this.ActiveMap) {
			return this.ActiveMap.resetView(layer, position, extent, useDoubleBuffer).pipe(
				mergeMap(() => this.resetPlugins())
			);
		}
		return of(true);
	}

	public addLayer(layer: any) {
		if (this.ActiveMap) {
			this.ActiveMap.addLayer(layer);
		}
	}

	public getLayers(): any[] {
		if (this.ActiveMap) {
			return this.ActiveMap.getLayers();
		}
		return [];
	}

	public removeLayer(layer: any) {
		if (this.ActiveMap) {
			this.ActiveMap.removeLayer(layer);
		}
	}

	ngOnInit() {
		const { worldView: { mapType, sourceType }, data: { position } } = this.mapSettings;
		this.setActiveMap(mapType, position, sourceType).then(() => {
			this.imageryCommunicatorService.createCommunicator(this);
		}, err => {
			console.error('Error loading map: ', err);
		});
	}

	ngOnDestroy() {
		this.imageryCommunicatorService.remove(this.id);
		this.destroyCurrentComponent();
	}

	destroyPlugins(): void {
		this.plugins.forEach((plugin) => plugin.dispose());
	}

	private onMapCreated(map: BaseImageryMap, activeMapName, oldMapName) {
		this._activeMap = map;
		if (activeMapName !== oldMapName && Boolean(oldMapName)) {
			this.mapInstanceChanged.emit({
				id: this.id,
				newMapInstanceName: activeMapName,
				oldMapInstanceName: oldMapName
			});
		}
	};

	private resetPlugins(): Observable<boolean> {
		if (!this.plugins || this.plugins.length === 0) {
			return of(true);
		}
		const resetObservables = this.plugins.map((plugin) => plugin.onResetView());
		return forkJoin(resetObservables).pipe(map(results => results.every(b => b === true)));
	}

	private createMapSourceForMapType(mapType: string, sourceType: string): Promise<any> {
		const sources: IMapSource[] = this.mapProvidersConfig[mapType].sources;
		const mapSource: IMapSource = sources.find(source => source.key === sourceType);
		const sourceProvider = this.getMapSourceProvider({
			mapType, sourceType: mapSource && mapSource.sourceType || ''
		});
		if (sourceProvider) {
			return sourceProvider.createAsync({
				...this.mapSettings,
				worldView: {...this.mapSettings.worldView, sourceType: mapSource.sourceType},
				data: { ...this.mapSettings.data, overlay: null, config: mapSource.config, key: mapSource.key }
			});
		}
		else {
			return Promise.resolve(false);
		}
	}

	private destroyCurrentComponent(): void {
		this.destroyPlugins();
		if (this._activeMap) {
			this._activeMap.dispose();
		}
		if (this._mapComponentRef) {
			this._mapComponentRef.destroy();
			this._mapComponentRef = undefined;
		}
	}

}
