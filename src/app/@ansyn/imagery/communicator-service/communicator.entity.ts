import { EventEmitter } from '@angular/core';
import { ImageryComponentManager, MapInstanceChanged } from '../imagery/manager/imagery.component.manager';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { IMap } from '../model/imap';
import { Observable } from 'rxjs/Observable';
import { CaseMapExtent, CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { GeoJsonObject, Point } from 'geojson';
import 'rxjs/add/observable/merge';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { BaseImageryVisualizer } from '@ansyn/imagery/model/base-imagery-visualizer';

export class CommunicatorEntity {
	private _managerSubscriptions;


	public positionChanged: EventEmitter<{ id: string, position: CaseMapPosition }>;
	public centerChanged: EventEmitter<Point>;
	public singleClick: EventEmitter<any>;
	public mapInstanceChanged: EventEmitter<MapInstanceChanged>;
	public imageryPluginsInitialized = new EventEmitter<string>();
	private _virtualNorth = 0;

	get imageryCommunicatorService(): ImageryCommunicatorService {
		return this._manager.imageryCommunicatorService;
	}

	get plugins(): BaseImageryPlugin[] {
		return this._manager.plugins;
	}

	get visualizers(): BaseImageryVisualizer[] {
		return <any> this.plugins.filter(plugin => plugin instanceof BaseImageryVisualizer);
	}

	constructor(public _manager: ImageryComponentManager) {
		this.centerChanged = new EventEmitter<Point>();
		this.positionChanged = new EventEmitter<{ id: string, position: CaseMapPosition }>();
		this.singleClick = new EventEmitter<any>();
		this.mapInstanceChanged = new EventEmitter<MapInstanceChanged>();

		this._managerSubscriptions = [];
		this.registerToManagerEvents();
	}

	initPlugins() {
		this.plugins.forEach((plugin: BaseImageryPlugin) => plugin.init(this));
		this.imageryPluginsInitialized.emit(this.id);
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.centerChanged.subscribe((center: Point) => {
			this.centerChanged.emit(center);
		}));

		this._managerSubscriptions.push(this._manager.positionChanged.subscribe((position: CaseMapPosition) => {
			this.positionChanged.emit({ id: this._manager.id, position });
		}));

		this._managerSubscriptions.push(this._manager.singleClick.subscribe((event: any) => {
			this.singleClick.emit(event);
		}));

		this._managerSubscriptions.push(this._manager.mapInstanceChanged.subscribe((event: any) => {
			this.mapInstanceChanged.emit(event);
		}));

		this._managerSubscriptions.push(
			Observable.merge(this.imageryCommunicatorService.instanceCreated, this._manager.mapInstanceChanged)
				.filter(({ id }) => id === this.id)
				.subscribe(this.initPlugins.bind(this))
		);
	}

	get id() {
		return this._manager.id;
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

	public setActiveMap(mapName: string, position?: CaseMapPosition, layer?: any): Promise<any> {
		return this._manager.setActiveMap(mapName, position, layer).then((data) => {
			return data;
		});
	}

	public get activeMapName(): string {
		if (this._manager) {
			return this._manager.activeMapName;
		}
		return '';
	}

	public loadInitialMapSource(position?: CaseMapPosition): Promise<any> {
		return this._manager.loadInitialMapSource(position);
	}

	public get ActiveMap(): IMap {
		if (this._manager) {
			return this._manager.ActiveMap;
		}
		return null;
	}

	public getCenter(): Observable<Point> {
		if (this.ActiveMap) {
			return this.ActiveMap.getCenter();
		}
		return Observable.of(null);
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

		return Observable.of(true);
	}

	public setPosition(position: CaseMapPosition): Observable<boolean> {
		if (!this.ActiveMap) {
			return Observable.throw(new Error('missing active map'));
		}

		return this.ActiveMap.setPosition(position);
	}

	public getPosition(): Observable<CaseMapPosition> {
		if (!this.ActiveMap) {
			return Observable.throw(new Error('missing active map'));
		}
		return this.ActiveMap.getPosition();
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

	public getPlugin<T = BaseImageryPlugin>(plugin: any): T {
		return <any>this.plugins.find((_plugin) => _plugin instanceof plugin);
	}

	public resetView(layer: any, position: CaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		this.setVirtualNorth(0);
		if (this._manager) {
			return this._manager.resetView(layer, position, extent);
		}

		return Observable.of(true);
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
}
