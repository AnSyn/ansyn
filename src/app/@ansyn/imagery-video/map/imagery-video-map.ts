import { BaseImageryMap, ImageryMap, ImageryMapExtent, IImageryMapPosition } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { GeoJsonObject, Point } from 'geojson';
import { HttpClient } from '@angular/common/http';
import { get as _get } from 'lodash';
import { ImageryVideoComponent } from '../components/imagery-video/imagery-video.component';
import * as turf from '@turf/turf';
import { ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { point, BBox } from '@turf/turf';

export const ImageryVideoMapType = 'VIDEO_MAP';
// @dynamic
@ImageryMap({
	mapType: ImageryVideoMapType,
	deps: [HttpClient, ComponentFactoryResolver]
})
export class ImageryVideoMap extends BaseImageryMap<any> {
	videoComponent: ImageryVideoComponent;
	mainLayer = null;

	constructor(protected http: HttpClient, public componentFactoryResolver: ComponentFactoryResolver) {
		super();
	}

	zoomIn(): void {

	}

	zoomOut(): void {
	}

	one2one(): void {
	}

	getCoordinateFromScreenPixel(screenPixel: { x: any; y: any; }): [number, number, number] {
		return [0, 0, 0];
	}

	getHtmlContainer(): HTMLElement {
		return this.videoComponent.video.nativeElement;
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

	getPosition(): Observable<IImageryMapPosition> {
		const _position = this._getPosition();
		return of(_position);
	}

	getRotation(): number {
		return this.videoComponent.rotation;
	}

	removeLayer(layer: any): void {
		this.mainLayer = null;
	}

	resetView(layer: any, position?: IImageryMapPosition, extent?: ImageryMapExtent, useDoubleBuffer?: boolean): Observable<boolean> {
		this.setMainLayer(layer);

		const currentPosition = this._getPosition();
		if (currentPosition) {
			this.positionChanged.emit(currentPosition);
		}
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

	setPosition(position: IImageryMapPosition): Observable<boolean> {
		return of(undefined);
	}

	setRotation(rotation: number): void {
		this.videoComponent.rotation = rotation;
	}

	toggleGroup(groupName: string, newState: boolean) {
	}

	updateSize(): void {
	}

	initMap(target: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layer: any, position?: IImageryMapPosition, viewContainerRef?: ViewContainerRef): Observable<boolean> {
		// this.videoComponent = <any>document.createElement(IMAGERY_VIDEO_COMPONENT_SELECTOR);
		// target.appendChild(<any>this.videoComponent);
		const comp = this.componentFactoryResolver.resolveComponentFactory(ImageryVideoComponent);
		const ref = viewContainerRef.createComponent<ImageryVideoComponent>(comp);
		this.videoComponent = ref.instance;
		return of(true);
	}

	private _getCenter(): Point {
		const line = turf.feature(_get(this.mainLayer, 'data.overlay.footprint'));
		return turf.center(line ? line : point([0, 0])).geometry
	}

	private _getPosition(): IImageryMapPosition {
		const position = _get(this.mainLayer, 'data.overlay.footprint');
		if (!position) {
			return null;
		}

		const line = turf.feature(position);
		const bbox: BBox = line ? turf.bbox(line) : [0, 0, 0, 0];
		const extentPolygon: any = turf.bboxPolygon(bbox).geometry;
		return { extentPolygon };
	}

}
