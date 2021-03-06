import { EventEmitter, ViewContainerRef } from '@angular/core';
import { Observable, throwError, EMPTY } from 'rxjs';
import { GeoJsonObject, Point } from 'geojson';
import { ImageryMapExtent, IImageryMapPosition, IMousePointerMove } from './case-map-position.model';
import { IMapErrorMessage, IMapProgress } from './map-progress.model';
import { IBaseImageryLayer } from './imagery-layer.model';
import { EPSG_4326 } from '../utils/geo';
import { IExportMapMetadata } from './export-map.model';

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
	groupLayers: Map<string, IBaseImageryLayer>;

	new(...args): BaseImageryMap;
}

// @dynamic
export abstract class BaseImageryMap<T = any> {
	static groupLayers = new Map<string, IBaseImageryLayer>();
	readonly deps?: any[];
	readonly mapType?: string;
	readonly defaultMapSource?: string;

	public positionChanged: EventEmitter<IImageryMapPosition> = new EventEmitter<IImageryMapPosition>();
	public mousePointerMoved: EventEmitter<IMousePointerMove> = new EventEmitter<IMousePointerMove>();
	public moveStart: EventEmitter<IImageryMapPosition> = new EventEmitter<IImageryMapPosition>();

	public tilesLoadProgressEventEmitter: EventEmitter<IMapProgress> = new EventEmitter<IMapProgress>();
	public tilesLoadErrorEventEmitter: EventEmitter<IMapErrorMessage> = new EventEmitter<IMapErrorMessage>();
	public abstract mapObject: T;

	abstract getCenter(): Observable<Point>;

	abstract setCenter(center: Point, animation: boolean): Observable<boolean>;

	abstract toggleGroup(groupName: string, newState: boolean);

	abstract initMap(element: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layer?: IBaseImageryLayer, position?: IImageryMapPosition, mapViewContainerRef?: ViewContainerRef): Observable<boolean>;

	// This method is for the use of the @AutoSubscription decorator
	initMapSubscriptions(): void {
	};

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param layer The new layer to set the view with. this layer projection will be the views projection
	 * @param extent The extent (bounding box points) of the map at ESPG:4326
	 */
	abstract resetView(layer: IBaseImageryLayer, position: IImageryMapPosition, extent?: ImageryMapExtent, useDoubleBuffer?: boolean): Observable<boolean>;

	abstract addLayer(layer: IBaseImageryLayer): void;

	addMapLayer(layer: IBaseImageryLayer): void {
		throw new Error('Method not implemented.');
	};

	getMainLayer(): IBaseImageryLayer {
		throw new Error('Method not implemented.');
	}

	abstract getLayers(): IBaseImageryLayer[];

	abstract getGroupLayers(): IBaseImageryLayer;

	abstract removeLayer(layer: IBaseImageryLayer): void;

	abstract setPosition(position: IImageryMapPosition): Observable<boolean>;

	abstract setRotation(rotation: number): void;

	abstract getRotation(): number;

	abstract zoomIn(): void;

	abstract zoomOut(): void;

	abstract one2one(): void;

	abstract getPosition(): Observable<IImageryMapPosition>;

	abstract updateSize(): void;

	abstract addGeojsonLayer(data: GeoJsonObject);

	abstract dispose(): void;

	abstract addLayerIfNotExist(layer: IBaseImageryLayer);

	abstract getCoordinateFromScreenPixel(screenPixel: { x, y }): [number, number, number];

	abstract getHtmlContainer(): HTMLElement;

	getProjectionCode(): string {
		return EPSG_4326;
	}

	getProjection(): string {
		return EPSG_4326;
	}


	fitToExtent(extent: any): Observable<any> {
		return EMPTY;
	};

	getExtraData(): { [key: string]: any } {
		return {}
	}

	exportMap(exportMetadata: IExportMapMetadata): Observable<HTMLCanvasElement> {
		return throwError(`Method not implement on ${this.mapType}`);
	}
}
