import { BaseImageryMap, ICanvasExportData, ImageryMap, ImageryMapExtent, ImageryMapPosition } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { GeoJsonObject, Point } from 'geojson';
import { HttpClient } from '@angular/common/http';
import { get as _get } from 'lodash';
import { ImageryVideoComponent } from '../components/imagery-video/imagery-video.component';
import * as turf from '@turf/turf';
import { ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

// @dynamic
@ImageryMap({
	mapType: 'VIDEO_MAP',
	deps: [HttpClient, ComponentFactoryResolver]
})
export class ImageryVideoMap extends BaseImageryMap<any> {
	videoComponent: ImageryVideoComponent;
	mainLayer = null;

	constructor(protected http: HttpClient, public componentFactoryResolver: ComponentFactoryResolver) {
		super();
	}

	zoomIn(): void {
		throw new Error('Method not implemented.');
	}

	zoomOut(): void {
		throw new Error('Method not implemented.');
	}

	one2one(): void {
		throw new Error('Method not implemented.');
	}

	getCoordinateFromScreenPixel(screenPixel: { x: any; y: any; }): [number, number, number] {
		throw new Error('Method not implemented.');
	}

	getHtmlContainer(): HTMLElement {
		throw new Error('Method not implemented.');
	}

	getExportData(): ICanvasExportData {
		throw new Error('Method not implemented.');
	}

	addGeojsonLayer(data: GeoJsonObject) {
	}

	addLayer(layer: any): void {
		this.videoComponent.src = _get(layer, 'data.overlay.imageUrl');
	}

	addLayerIfNotExist(layer: any) {
	}

	dispose(): void {
	}

	getCenter(): Observable<Point> {
		const _center = this._getCenter();
		return of(_center);
	}

	getLayers(): any[] {
		return [this.mainLayer];
	}

	getPosition(): Observable<ImageryMapPosition> {
		const _position = this._getPosition();
		return of(_position);
	}

	getRotation(): number {
		return this.videoComponent.rotation;
	}

	removeLayer(layer: any): void {
		this.mainLayer = null;
	}

	resetView(layer: any, position?: ImageryMapPosition, extent?: ImageryMapExtent, useDoubleBuffer?: boolean): Observable<boolean> {
		this.setMainLayer(layer);
		this.positionChanged.emit(this._getPosition());
		return of(true);
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return of(undefined);
	}

	setMainLayer(layer) {
		this.mainLayer = layer;
		this.addLayer(layer);
	}

	getMainLayer() {
		return this.mainLayer;
	}

	setPosition(position: ImageryMapPosition): Observable<boolean> {
		return of(undefined);
	}

	setRotation(rotation: number): void {
		this.videoComponent.rotation = rotation;
	}

	toggleGroup(groupName: string, newState: boolean) {
	}

	updateSize(): void {
	}

	initMap(target: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layer: any, position?: ImageryMapPosition, viewContainerRef?: ViewContainerRef): Observable<boolean> {
		// this.videoComponent = <any>document.createElement(IMAGERY_VIDEO_COMPONENT_SELECTOR);
		// target.appendChild(<any>this.videoComponent);
		const comp = this.componentFactoryResolver.resolveComponentFactory(ImageryVideoComponent);
		const ref = viewContainerRef.createComponent<ImageryVideoComponent>(comp);
		this.videoComponent = ref.instance;
		return of(true);
	}

	private _getCenter(): Point {
		const line = turf.feature(_get(this.mainLayer, 'data.overlay.footprint'));
		return turf.center(line).geometry
	}

	private _getPosition(): ImageryMapPosition {
		const line = turf.feature(_get(this.mainLayer, 'data.overlay.footprint'));
		const bbox = turf.bbox(line);
		const extentPolygon: any = turf.bboxPolygon(bbox).geometry;
		return { extentPolygon };
	}

}
