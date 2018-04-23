import { EventEmitter, Injectable } from '@angular/core';
import { IMap } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import * as ol from 'openlayers';
import Map from 'ol/map';
import View from 'ol/view';
import proj from 'ol/proj';
import ScaleLine from 'ol/control/scaleline';
import Layer from 'ol/layer/layer';
import ImageLayer from 'ol/layer/image';
import Raster from 'ol/source/raster';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import * as turf from '@turf/turf';
import { GeoJsonObject, Point } from 'geojson';
export const DisabledOpenLayersMapName = 'disabledOpenLayersMap';

@Injectable()
export class OpenLayersDisabledMap extends IMap<Map> {
	centerChanged: EventEmitter<Point> = new EventEmitter<Point>();
	positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	pointerMove: EventEmitter<any> = new EventEmitter<any>();
	singleClick: EventEmitter<any> = new EventEmitter<any>();
	contextMenu: EventEmitter<any> = new EventEmitter<any>();
	mapType: string = DisabledOpenLayersMapName;
	mapObject: Map;
	mainLayer: Layer;

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition): Observable<boolean> {
		this.mapObject = new Map({
			target: element,
			renderer: 'canvas',
			controls: [new ScaleLine()]
		});
		this.setMainLayer(layers[0], position);
		return Observable.of(true);
	}

	getLayers(): any[] {
		return this.mapObject.getLayers().getArray();
	}

	public getCenter(): Observable<Point> {
		const view = this.mapObject.getView();
		const center = view.getCenter();
		const point = <Point> turf.geometry('Point', center);

		return this.projectionService.projectAccurately(point, this);
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return Observable.of(true);
	}

	addLayerIfNotExist(layer: Layer) {

	}

	toggleGroup(groupName: string) {
	}

	resetView(layer: any, position?: CaseMapPosition): Observable<boolean> {
		this.setMainLayer(layer, position);
		return Observable.of(true);
	}

	setMainLayer(layer: Layer, position?: CaseMapPosition) {
		if (this.mainLayer) {
			this.mapObject.removeLayer(this.mainLayer);
			this.mapObject.render();
		}

		this.mainLayer = layer;
		const view = this.generateNewView(layer, position);
		this.mapObject.setView(view);
		this.addLayer(this.mainLayer);
		const layerExtent = this.mainLayer.getExtent();
		if (layerExtent) {
			this.fitToMainLayerExtent(layerExtent);
		}
	}

	generateNewView(layer: Layer, position?: CaseMapPosition): View {
		const newProjection = layer.getSource().getProjection();

		// for outside only
		if (position && position.projectedState.projection.code === newProjection.getCode()) {
			return new View({
				projection: newProjection,
				center: position.projectedState.center,
				zoom: position.projectedState.zoom,
				rotation: position.projectedState.rotation
			});
		}
		return new View({
			projection: newProjection
		});
	}

	fitToMainLayerExtent(extent: ol.Extent) {
		const view = this.mapObject.getView();
		view.fit(extent, {
			size: this.mapObject.getSize(),
			constrainResolution: false
		});
	}

	addLayer(layer: Layer): void {
		this.mapObject.addLayer(layer);
	}

	removeLayer(layer: any): void {
	}

	setPosition(position: CaseMapPosition): Observable<boolean> {
		return Observable.of(true);
	}

	getPosition(): Observable<CaseMapPosition> {
		return Observable.of(undefined);
	}

	setRotation(rotation: number): void {
	}

	updateSize(): void {
		this.mapObject.updateSize();
	}

	addGeojsonLayer(data: GeoJsonObject): void {
	}

	setPointerMove(enable: boolean) {
	}

	getPointerMove() {
		return new Observable();
	}

	removeSingleClickEvent() {
	}


	getRotation(): number {
		return NaN;
	}

	dispose() {

	}

	addSingleClickEvent() {

	}
}
