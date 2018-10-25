import { EventEmitter } from '@angular/core';
import { ImageryComponentManager, IMapInstanceChanged } from '../imagery/manager/imagery.component.manager';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { BaseImageryMap, IBaseImageryMapConstructor } from '../model/base-imagery-map';
import { merge, Observable, of, throwError } from 'rxjs';
import { CaseMapExtent, ICaseMapPosition } from '@ansyn/core';
import { GeoJsonObject, Point } from 'geojson';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { BaseImageryVisualizer } from '../model/base-imagery-visualizer';
import { filter } from 'rxjs/operators';

export class CommunicatorEntity {
	private _managerSubscriptions = [];


	public mapInstanceChanged = new EventEmitter<IMapInstanceChanged>();
	private _virtualNorth = 0;

	get imageryCommunicatorService(): ImageryCommunicatorService {
		return this._manager.imageryCommunicatorService;
	}

	get plugins() {
		return this._manager.plugins;
	}

	get visualizers(): BaseImageryVisualizer[] {
		return <any> this.plugins.filter(plugin => plugin instanceof BaseImageryVisualizer);
	}

	get getMapSourceProvider() {
		return this._manager.getMapSourceProvider.bind(this._manager);
	}

	get positionChanged() {
		return this.ActiveMap.positionChanged;
	}

	constructor(public _manager: ImageryComponentManager) {
		this.registerToManagerEvents();
	}

	initPlugins() {
		this.plugins.forEach((plugin) => plugin.init(this as any));
	}

	private registerToManagerEvents() {
		this._managerSubscriptions.push(this._manager.mapInstanceChanged.subscribe((event: any) => {
			this.mapInstanceChanged.emit(event);
		}));

		this._managerSubscriptions.push(
			merge(this.imageryCommunicatorService.instanceCreated, this._manager.mapInstanceChanged)
				.pipe(filter(({ id }) => id === this.id))
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

	get setActiveMap() {
		return this._manager.setActiveMap.bind(this._manager);
	}

	public get activeMapName(): string {
		if (this._manager) {
			return this._manager.activeMapName;
		}
		return '';
	}

	public loadInitialMapSource(position?: ICaseMapPosition): Promise<any> {
		return this._manager.loadInitialMapSource(position);
	}

	public get ActiveMap(): BaseImageryMap {
		if (this._manager) {
			return this._manager.ActiveMap;
		}
		return null;
	}

	public get mapType() {
		if (this.ActiveMap) {
			return (<IBaseImageryMapConstructor> this.ActiveMap.constructor).mapType;
		}
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

	public setPosition(position: ICaseMapPosition): Observable<boolean> {
		if (!this.ActiveMap) {
			return throwError(new Error('missing active map'));
		}

		return this.ActiveMap.setPosition(position);
	}

	public getPosition(): Observable<ICaseMapPosition> {
		if (!this.ActiveMap) {
			return throwError(new Error('missing active map'));
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

	public resetView(layer: any, position: ICaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		this.setVirtualNorth(0);
		if (this._manager) {
			return this._manager.resetView(layer, position, extent);
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
}
