import { EventEmitter } from '@angular/core';
import { IMap, MapPosition } from '@ansyn/imagery';

import Map from 'ol/map';
import View from 'ol/view';
import Extent from 'ol/extent';
import proj from 'ol/proj';
import Rotate from 'ol/control/rotate';
import Layer from 'ol/layer/layer';

export class OpenLayersDisabledMap implements IMap {
	static mapType = 'openLayersMap';

	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<MapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;
	contextMenu: EventEmitter<any>;
	mapType: string;
	mapObject: any;

	mainLayer: Layer;

	constructor(element: HTMLElement, layers: any, position?: MapPosition) {
		this.mapType = OpenLayersDisabledMap.mapType;
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.pointerMove = new EventEmitter<any>();
		this.singleClick = new EventEmitter<any>();
		this.contextMenu = new EventEmitter<any>();

		this.initMap(element, layers, position);
	}

	private initMap(element: HTMLElement, layers: any, position?: MapPosition) {

		let center = [16, 38];
		let zoom = 12;
		let rotation = 0;
		if (position) {
			center = position.center.coordinates;
			zoom = position.zoom;
			rotation = position.rotation;
		}
		this.mapObject = new Map({
			target: element,
			renderer: 'canvas',
			controls: [new Rotate({
				autoHide: false
			})]
		});
		this.setMainLayer(layers[0], null, position);
		const containerElem = <HTMLElement> this.mapObject.getViewport();
		containerElem.addEventListener('contextmenu', (e: MouseEvent) => {
			e.preventDefault();
		});
	}

	getCenter(): GeoJSON.Point {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const center = view.getCenter();
		const transformedCenter = proj.transform(center, projection, 'EPSG:4326');
		const geoPoint: GeoJSON.Point = {
			type: 'Point',
			coordinates: transformedCenter
		};
		return geoPoint;
	}

	setCenter(center: GeoJSON.Point, animation: boolean) {

	}

	setBoundingBox(bbox: GeoJSON.Point[]) {
	}

	resetView(layer: any, extent?: GeoJSON.Point[]): void {
		const view = this.mapObject.getView();
		this.setMainLayer(layer, view);
	}

	private setMainLayer(layer: Layer, currentView: View, position?: MapPosition) {
		if (this.mainLayer) {
			this.mapObject.removeLayer(this.mainLayer);
			this.mapObject.render();
		}

		this.mainLayer = layer;
		const newView =	this.generateNewView(layer, currentView, position);
		this.mapObject.setView(newView);
		this.mapObject.addLayer(this.mainLayer);
		const layerExtent = this.mainLayer.getExtent();
		if (layerExtent) {
			this.fitToMainLayerExtent(layerExtent);
		}
	}

	private generateNewView(layer: Layer, oldview: View, position: MapPosition): any {
		let newCenter = [0, 0];
		let newZoom;
		let newRotation;
		const newProjection = layer.getSource().getProjection();

		if (!oldview) {
			newCenter = position ? position.center.coordinates : newCenter;
			newZoom = position ? position.zoom : 12;
			newRotation  = position ? position.rotation : 0;
		} else {
			newZoom = position ? position.zoom : oldview.getZoom();
			newRotation  = position ? position.rotation : oldview.getRotation();

			const oldCenter = oldview.getCenter();
			const oldProjection = oldview.getProjection();
			const center = proj.transform([oldCenter[0], oldCenter[1]], oldProjection, 'EPSG:4326');
			if (center) {
				newCenter = center;
			}
		}
		newCenter = proj.transform([newCenter[0], newCenter[1]], 'EPSG:4326', newProjection);
		const view: any = new View({
			center: newCenter,
			zoom: newZoom,
			rotation: newRotation,
			projection: newProjection
		});
		return view;
	}

	private fitToMainLayerExtent(extent: Extent) {
		const view = this.mapObject.getView();
		view.fit(extent, {
			size: this.mapObject.getSize(),
			constrainResolution: false
		});
	}

	addLayer(layer: any): void {
	}

	removeLayer(layer: any): void {
	}

	addVectorLayer(layer: any): void {
	}

	removeVectorLayer(layer: any): void {
	}

	setPosition(MapPosition): void {
	}

	getPosition(): MapPosition {
		const view = this.mapObject.getView();
		let center: GeoJSON.Point = this.getCenter();
		let zoom: number = view.getZoom();
		let rotation: number = view.getRotation();

		const result: MapPosition = { center, zoom, rotation };
		return result;
	}

	updateSize(): void {
		this.mapObject.updateSize();
	}

	addGeojsonLayer(data: GeoJSON.GeoJsonObject): void {}

	togglePointerMove() {}

	removeSingleClickEvent() {}

	setAutoImageProcessing(shouldPerform: boolean = false): void {
		//TODO: ask (why he needs to locate a specific layer and how it is added)
	}

	dispose() {

	}

	startMouseShadowVectorLayer() {

	}

	stopMouseShadowVectorLayer() {

	}

	drawShadowMouse(latLon: any) {

	}

	addSingleClickEvent() {

	}

	addPinPointIndicator(latLon: any) {

	}

	removePinPointIndicator() {

	}
}
