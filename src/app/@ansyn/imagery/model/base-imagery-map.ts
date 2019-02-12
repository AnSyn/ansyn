import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CaseMapExtent, ICaseMapPosition, IMapErrorMessage, IMapProgress } from '@ansyn/core';
import { GeoJsonObject, Point } from 'geojson';

export interface IImageryMapMetaData {
	deps?: any[];
	mapType?: string;
	defaultMapSource?: string;
}

export interface IBaseImageryMapConstructor {
	groupLayers: Map<string, any>;

	new(...args): BaseImageryMap;
}

// @dynamic
export abstract class BaseImageryMap<T = any> {
	static groupLayers = new Map<string, any>();
	readonly deps?: any[];
	readonly mapType?: string;
	readonly defaultMapSource?: string;

	public positionChanged: EventEmitter<ICaseMapPosition> = new EventEmitter<ICaseMapPosition>();
	public tilesLoadProgressEventEmitter: EventEmitter<IMapProgress> = new EventEmitter<IMapProgress>();
	public tilesLoadErrorEventEmitter: EventEmitter<IMapErrorMessage> = new EventEmitter<IMapErrorMessage>();
	public mapObject: T;
	public backgroundMapObject: T;

	abstract getCenter(): Observable<Point>;

	abstract setCenter(center: Point, animation: boolean): Observable<boolean>;

	abstract toggleGroup(groupName: string, newState: boolean);

	abstract initMap(element: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layers?: any, position?: ICaseMapPosition): Observable<boolean>;

	initMapSubscriptions(): void {
	};

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param layer The new layer to set the view with. this layer projection will be the views projection
	 * @param extent The extent (bounding box points) of the map at ESPG:4326
	 */
	abstract resetView(layer: any, position: ICaseMapPosition, extent?: CaseMapExtent, useDoubleBuffer?: boolean): Observable<boolean>;

	abstract addLayer(layer: any): void;

	getMainLayer(): any {
		throw new Error('Method not implemented.');
	}

	abstract getLayers(): any[];

	abstract removeLayer(layer: any): void;

	abstract setPosition(position: ICaseMapPosition): Observable<boolean>;

	abstract setRotation(rotation: number): void;

	abstract getRotation(): number;

	abstract getPosition(): Observable<ICaseMapPosition>;

	abstract updateSize(): void;

	abstract addGeojsonLayer(data: GeoJsonObject);

	abstract dispose(): void;

	abstract addLayerIfNotExist(layer: any);

	fitToExtent(extent: any): Observable<any> {
		throw new Error('Method not implemented.');
	};
}
