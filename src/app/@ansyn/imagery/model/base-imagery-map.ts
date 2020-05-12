import { EventEmitter, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { GeoJsonObject, Point } from 'geojson';
import { ImageryMapExtent, ImageryMapPosition, IMousePointerMove } from './case-map-position.model';
import { IMapErrorMessage, IMapProgress } from './map-progress.model';

export interface IImageryMapMetaData {
	deps?: any[];
	mapType?: string;
	defaultMapSource?: string;
}

export interface ICanvasExportData {
	width: number;
	height: number;
	data: string;
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

	public positionChanged: EventEmitter<ImageryMapPosition> = new EventEmitter<ImageryMapPosition>();
	public mousePointerMoved: EventEmitter<IMousePointerMove> = new EventEmitter<IMousePointerMove>();
	public moveStart: EventEmitter<ImageryMapPosition> = new EventEmitter<ImageryMapPosition>();

	public tilesLoadProgressEventEmitter: EventEmitter<IMapProgress> = new EventEmitter<IMapProgress>();
	public tilesLoadErrorEventEmitter: EventEmitter<IMapErrorMessage> = new EventEmitter<IMapErrorMessage>();
	public mapObject: T;

	abstract getCenter(): Observable<Point>;

	abstract setCenter(center: Point, animation: boolean): Observable<boolean>;

	abstract toggleGroup(groupName: string, newState: boolean);

	abstract initMap(element: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layer?: any, position?: ImageryMapPosition, mapViewContainerRef?: ViewContainerRef): Observable<boolean>;

	// This method is for the use of the @AutoSubscription decorator
	initMapSubscriptions(): void {
	};

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param layer The new layer to set the view with. this layer projection will be the views projection
	 * @param extent The extent (bounding box points) of the map at ESPG:4326
	 */
	abstract resetView(layer: any, position: ImageryMapPosition, extent?: ImageryMapExtent, useDoubleBuffer?: boolean): Observable<boolean>;

	abstract addLayer(layer: any): void;

	addMapLayer(layer: any): void {
		throw new Error('Method not implemented.');
	};

	getMainLayer(): any {
		throw new Error('Method not implemented.');
	}

	abstract getLayers(): any[];

	abstract removeLayer(layer: any): void;

	abstract setPosition(position: ImageryMapPosition): Observable<boolean>;

	abstract setRotation(rotation: number): void;

	abstract getRotation(): number;

	abstract zoomIn(): void;

	abstract zoomOut(): void;

	abstract one2one(): void;

	abstract getPosition(): Observable<ImageryMapPosition>;

	abstract updateSize(): void;

	abstract addGeojsonLayer(data: GeoJsonObject);

	abstract dispose(): void;

	abstract addLayerIfNotExist(layer: any);

	abstract getCoordinateFromScreenPixel(screenPixel: { x, y }): [number, number, number];

	abstract getHtmlContainer(): HTMLElement;

	fitToExtent(extent: any): Observable<any> {
		throw new Error('Method not implemented.');
	};

	getExtraData(): { [key: string]: any } {
		return {}
	}
}
