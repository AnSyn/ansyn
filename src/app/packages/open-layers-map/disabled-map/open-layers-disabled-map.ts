import { EventEmitter } from '@angular/core';
import { IMap } from '@ansyn/imagery';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';
import { Observable } from 'rxjs/Observable';
import Map from 'ol/map';
import View from 'ol/view';
import Extent from 'ol/extent';
import proj from 'ol/proj';
import ScaleLine from 'ol/control/scaleline';
import Layer from 'ol/layer/layer';
import ImageLayer from 'ol/layer/image';
import Raster from 'ol/source/raster';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';

export class OpenLayersDisabledMap extends IMap {
	static mapType = 'openLayersMap';

	centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	pointerMove: EventEmitter<any> = new EventEmitter<any>();
	singleClick: EventEmitter<any> = new EventEmitter<any>();
	contextMenu: EventEmitter<any> = new EventEmitter<any>();
	mapType: string = OpenLayersDisabledMap.mapType;
	mapObject: any;
	mainLayer: Layer;

	_imageProcessing: OpenLayersImageProcessing;

	constructor(element: HTMLElement, layers: any, position?: CaseMapPosition) {
		super();

		this.initMap(element, layers);
	}

	initMap(element: HTMLElement, layers: any) {
		this.mapObject = new Map({
			target: element,
			renderer: 'canvas',
			controls: [new ScaleLine()]
		});
		this.setMainLayer(layers[0]);
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

	addLayerIfNotExist(layer: Layer) {

	}

	toggleGroup(groupName: string) {
	}

	resetView(layer: any): void {
		this.setMainLayer(layer);
	}

	setMainLayer(layer: Layer) {
		if (this.mainLayer) {
			this.mapObject.removeLayer(this.mainLayer);
			this.mapObject.render();
		}

		this.mainLayer = layer;
		const view = this.generateNewView(layer);
		this.mapObject.setView(view);
		this.addLayer(this.mainLayer);
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

	generateNewView(layer: Layer): View {
		const newProjection = layer.getSource().getProjection();
		return new View({
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

	addLayer(layer: Layer): void {
		this.mapObject.addLayer(layer);
	}

	removeLayer(layer: any): void {
	}

	setPosition(position: CaseMapPosition): void {
	}

	getPosition(): CaseMapPosition {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		let rotation: number = view.getRotation();
		const transformExtent = view.calculateExtent(this.mapObject.getSize());
		const extent = proj.transformExtent(transformExtent, projection, 'EPSG:4326');
		const resolution = view.getResolution();
		return { rotation, extent, resolution };
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
