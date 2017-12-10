import { EventEmitter } from '@angular/core';
import { IMap, MapPosition } from '@ansyn/imagery';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';
import { Observable } from 'rxjs/Observable';

import Map from 'ol/map';
import View from 'ol/view';
import Extent from 'ol/extent';
import proj from 'ol/proj';
import Rotate from 'ol/control/rotate';
import Layer from 'ol/layer/layer';
import ImageLayer from 'ol/layer/image';
import Raster from 'ol/source/raster';

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

	private _imageProcessing: OpenLayersImageProcessing;

	constructor(element: HTMLElement, layers: any, position?: MapPosition) {
		this.mapType = OpenLayersDisabledMap.mapType;
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.pointerMove = new EventEmitter<any>();
		this.singleClick = new EventEmitter<any>();
		this.contextMenu = new EventEmitter<any>();
		this.initMap(element, layers, position);
	}

	initMap(element: HTMLElement, layers: any, position?: MapPosition) {
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
		return {
			type: 'Point',
			coordinates: transformedCenter
		};
	}

	setCenter(center: GeoJSON.Point, animation: boolean) {

	}

	setBoundingBox(bbox: GeoJSON.Point[]) {
	}

	addLayerIfNotExist(layer: Layer) {

	}

	resetView(layer: any, extent?: GeoJSON.Point[]): void {
		const view = this.mapObject.getView();
		this.setMainLayer(layer, view);
	}

	setMainLayer(layer: Layer, currentView: View, position?: MapPosition) {
		if (this.mainLayer) {
			this.mapObject.removeLayer(this.mainLayer);
			this.mapObject.render();
		}

		this.mainLayer = layer;
		const newView = this.generateNewView(layer, currentView, position);
		this.mapObject.setView(newView);
		this.mapObject.addLayer(this.mainLayer);
		const layerExtent = this.mainLayer.getExtent();
		if (layerExtent) {
			this.fitToMainLayerExtent(layerExtent);
		}

		if (layer.getSource() instanceof Raster) {
			this._imageProcessing = new OpenLayersImageProcessing(layer.getSource());
		} else {
			this._imageProcessing = null;
		}
	}

	generateNewView(layer: Layer, oldview: View, position: MapPosition): any {
		let newCenter = [0, 0];
		let newZoom;
		let newRotation;
		const newProjection = layer.getSource().getProjection();

		if (!oldview) {
			newCenter = position ? position.center.coordinates : newCenter;
			newZoom = position ? position.zoom : 12;
			newRotation = position ? position.rotation : 0;
		} else {
			newZoom = position ? position.zoom : oldview.getZoom();
			newRotation = position ? position.rotation : oldview.getRotation();

			const oldCenter = oldview.getCenter();
			const oldProjection = oldview.getProjection();
			const center = proj.transform([oldCenter[0], oldCenter[1]], oldProjection, 'EPSG:4326');
			if (center) {
				newCenter = center;
			}
		}
		newCenter = proj.transform([newCenter[0], newCenter[1]], 'EPSG:4326', newProjection);
		return new View({
			center: newCenter,
			zoom: newZoom,
			rotation: newRotation,
			projection: newProjection
		});
	}

	fitToMainLayerExtent(extent: Extent) {
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

		return { center, zoom, rotation };
	}

	setRotation(rotation: number): void {
	}

	updateSize(): void {
		this.mapObject.updateSize();
	}

	addGeojsonLayer(data: GeoJSON.GeoJsonObject): void {
	}

	setPointerMove(enable: boolean) {
	}

	getPointerMove() {
		return new Observable();
	}

	removeSingleClickEvent() {
	}

	public setAutoImageProcessing(shouldPerform: boolean = false): void {
		let imageLayer: ImageLayer = <ImageLayer>this.mainLayer;
		if (!imageLayer) {
			return;
		}
		if (shouldPerform) {
			// the determine the order which by the image processing will occur
			const processingParams = {
				Histogram: { auto: true },
				Sharpness: { auto: true }
			};
			this._imageProcessing.processImage(processingParams);
		} else {
			this._imageProcessing.processImage(null);
		}
	}

	public setManualImageProcessing(processingParams: Object) {
		let imageLayer: ImageLayer = <ImageLayer>this.mainLayer;
		if (!imageLayer) {
			return;
		}
		this._imageProcessing.processImage(processingParams);
	}

	dispose() {

	}

	addSingleClickEvent() {

	}
}
