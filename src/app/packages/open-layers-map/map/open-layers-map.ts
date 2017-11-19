import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { MapPosition } from '@ansyn/imagery/model/map-position';
import { Utils } from './utils';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';

import Map from 'ol/map';
import View from 'ol/view';
import Extent from 'ol/extent';
import proj from 'ol/proj';
import Rotate from 'ol/control/rotate';

import GeoJSON from 'ol/format/geojson';
import Point from 'ol/geom/point';

import Vector from 'ol/source/vector';
import Raster from 'ol/source/raster';
import OSM from 'ol/source/osm';

import Layer from 'ol/layer/layer';
import TileLayer from 'ol/layer/tile';
import ImageLayer from 'ol/layer/image';
import VectorLayer from 'ol/layer/vector';


export class OpenLayersMap implements IMap<Map> {
	static mapType = 'openLayersMap';

	public mapType: string;
	private _mapObject: Map;
	private _mapLayers = [];
	private _mapVectorLayers = [];
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<MapPosition>;
	public pointerMove: EventEmitter<any>;
	public singleClick: EventEmitter<any>;
	public contextMenu: EventEmitter<any>;

	private _pinPointIndicatorLayerId = 'pinPointIndicator';
	private _flags = {
		singleClickHandler: null
	};

	private _imageProcessing: OpenLayersImageProcessing;

	constructor(element: HTMLElement, layers: any, position?: MapPosition) {
		this.mapType = OpenLayersMap.mapType;
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.pointerMove = new EventEmitter<any>();
		this.singleClick = new EventEmitter<any>();
		this.contextMenu = new EventEmitter<any>();
		this._imageProcessing = new OpenLayersImageProcessing();

		this.initMap(element, layers, position);
	}

	public positionToPoint(x, y): GeoJSON.Point {
		let coordinates = this._mapObject.getCoordinateFromPixel([x, y]);
		const projection = this._mapObject.getView().getProjection();
		coordinates = proj.toLonLat(coordinates, projection);
		return { type: 'Point', coordinates };
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

		this._mapObject = new Map({
			target: element,
			layers: layers,
			renderer: 'canvas',
			controls: [new Rotate({
				autoHide: false
			})],
			view: new View({
				center: proj.fromLonLat([center[0], center[1]]),
				zoom: zoom,
				rotation: rotation,
				minZoom: 2.5
			})
		});

		this._mapLayers = layers;

		if (position && position.boundingBox) {
			this.setBoundingBox(position.boundingBox);
		}

		this._mapObject.on('moveend', () => {
			const mapCenter = this.getCenter();
			this.centerChanged.emit(mapCenter);
			this.positionChanged.emit(this.getPosition());
		});

		const containerElem = <HTMLElement> this._mapObject.getViewport();

		containerElem.addEventListener('contextmenu', (e: MouseEvent) => {
			e.preventDefault();

			containerElem.click();

			const point = this.positionToPoint(e.offsetX, e.offsetY);
			this.contextMenu.emit({ point, e });
		});
	}


	// IMap Start

	public resetView(layer: any, extent?: GeoJSON.Point[]) {
		this.setMainLayer(layer);
		if (extent) {
			this.fitCurrentView(layer, extent);
		}
	}

	public getLayerById(id: string) {
		return this.mapObject.getLayers().getArray().filter(item => item.get('id') === id)[0];
	}

	private setMainLayer(layer: Layer) {
		this.removeAllLayers();

		const oldview = this._mapObject.getView();
		const currentZoom = oldview.getZoom();
		const currentCenter = oldview.getCenter();
		const currentRotation = oldview.getRotation();

		const projection = oldview.getProjection();
		let newCenter = proj.transform([currentCenter[0], currentCenter[1]], projection, layer.getSource().getProjection());

		if (!newCenter) {
			newCenter = [0, 0];
		}

		const view: any = new View({
			center: newCenter,
			zoom: currentZoom,
			rotation: currentRotation,
			projection: layer.getSource().getProjection(),
			minZoom: 2.5
		});

		this._mapObject.setView(view);
		this.addLayer(layer);
	}

	addInteraction(interaction) {
		this._mapObject.addInteraction(interaction);
	}

	removeInteraction(interaction) {
		this._mapObject.removeInteraction(interaction);
	}


	private internalBeforeSetMainLayer(): { pinPointLonLatGeo } {
		const pinPointIndicatorLayer: Layer = <Layer>this.getLayerById(this._pinPointIndicatorLayerId);
		let lonLatCords;
		if (pinPointIndicatorLayer) {
			let pinPointGeometry = (<any>pinPointIndicatorLayer).getSource().getFeatures()[0].getGeometry();
			const oldView = this._mapObject.getView();
			const oldViewProjection = oldView.getProjection();
			const layerCords = pinPointGeometry.getCoordinates();
			lonLatCords = proj.transform(layerCords, oldViewProjection, 'EPSG:4326');
		}
		return { pinPointLonLatGeo: lonLatCords };
	}

	private fitCurrentView(layer: Layer, extent?: GeoJSON.Point[]) {
		const view = this._mapObject.getView();
		const viewProjection = view.getProjection();
		const layerExtent = layer.getExtent();
		let projectedViewExtent;

		if (layerExtent && extent) {
			const positionExtent = Utils.BoundingBoxToOLExtent(extent);
			projectedViewExtent = proj.transformExtent(positionExtent, 'EPSG:4326', viewProjection);
			const intersects = Extent.intersects(layerExtent, projectedViewExtent);
			if (intersects) {
				this.fitToExtent(projectedViewExtent);
			} else {
				this.fitToExtent(layerExtent);
			}
		} else if (layerExtent) {
			this.fitToExtent(layerExtent);
		}
		else if (extent) {
			const positionExtent = Utils.BoundingBoxToOLExtent(extent);
			projectedViewExtent = proj.transformExtent(positionExtent, 'EPSG:4326', viewProjection);
			this.fitToExtent(projectedViewExtent);
		}
	}

	private fitToExtent(extent: Extent) {
		const view = this._mapObject.getView();
		view.fit(extent, {
			size: this._mapObject.getSize(),
			constrainResolution: false
		});
	}

	public addLayer(layer: any) {
		this._mapLayers.push(layer);
		this._mapObject.addLayer(layer);
	}

	/**
	 * add layer to the map if it is not already exists the layer must have an id set
	 * @param layer
	 */
	public addLayerIfNotExist(layer): Layer {
		const layerId = layer.get('id');
		if (!layerId) {
			return;
		}
		const existingLayer = this.getLayerById(layerId);
		if (!existingLayer) {
			// layer.set('visible',false);
			this.addLayer(layer);
			return layer;
		}
		return existingLayer;
	}


	public removeAllLayers() {
		while (this._mapLayers.length > 0) {
			this.removeLayer(this._mapLayers[0]);
		}

		this._mapLayers = [];
	}

	public removeLayer(layer: any): void {
		if (!layer) {
			return;
		}
		const index = this._mapLayers.indexOf(layer);
		if (index > -1) {
			this._mapLayers.splice(index, 1);
			this._mapObject.removeLayer(layer);
			this._mapObject.render();
		}

		if (layer.getSource() instanceof Raster) {
			this._imageProcessing.removeAllRasterOperations(layer.getSource());
		}

	}

	public removeLayerById(layerId) {
		const layer = this.getLayerById(layerId);
		if (layer) {
			// layer.set('visible',false);
			this.removeLayer(layer);
		}
	}

	// In the future we'll use @ansyn/map-source-provider
	public addVectorLayer(layer: any): void {
		const vectorLayer = new TileLayer({
			zIndex: 1,
			source: new OSM({
				attributions: [
					layer.name
				],
				opaque: false,
				url: layer.url,
				crossOrigin: null
			})
		});
		this._mapObject.addLayer(vectorLayer);
		this._mapVectorLayers[layer.id] = vectorLayer;
	}

	public removeVectorLayer(layer: any): void {
		this._mapObject.removeLayer(this._mapVectorLayers[layer.id]);
		delete this._mapVectorLayers[layer.id];
	}

	public get mapObject() {
		return this._mapObject;
	}

	public setCenter(center: GeoJSON.Point, animation: boolean) {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const olCenter = proj.transform([center.coordinates[0], center.coordinates[1]], 'EPSG:4326', projection);
		if (animation) {
			this.flyTo(olCenter);
		} else {
			view.setCenter(olCenter);
		}
	}

	public updateSize(): void {
		this._mapObject.updateSize();
	}

	public getCenter(): GeoJSON.Point {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const center = view.getCenter();
		const transformedCenter = proj.transform(center, projection, 'EPSG:4326');
		return {
			type: 'Point',
			coordinates: transformedCenter
		};
	}

	public setPosition(position: MapPosition): void {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const olCenter = proj.transform([position.center.coordinates[0], position.center.coordinates[1]], 'EPSG:4326', projection);
		view.setCenter(olCenter);
		view.setRotation(position.rotation);
		view.setZoom(position.zoom);
	}

	public getPosition(): MapPosition {
		const view = this._mapObject.getView();
		let center: GeoJSON.Point = this.getCenter();
		let zoom: number = view.getZoom();
		let rotation: number = view.getRotation();
		let boundingBox = this.getMapExtentInGeo();

		return { center, zoom, rotation, boundingBox };
	}

	private getMapExtentInGeo() {
		const view = this._mapObject.getView();
		const viewProjection = view.getProjection();
		const viewExtent = view.calculateExtent(this._mapObject.getSize());
		const viewExtentGeo = proj.transformExtent(viewExtent, viewProjection, 'EPSG:4326');
		return Utils.OLExtentToBoundingBox(viewExtentGeo);
	}

	private flyTo(location) {
		const view = this._mapObject.getView();
		view.animate({
			center: location,
			duration: 2000
		});
	}

	public setBoundingBox(bbox: GeoJSON.Point[]) {
		const geoViewExtent: Extent = Utils.BoundingBoxToOLExtent(bbox);
		const view = this._mapObject.getView();
		const viewProjection = view.getProjection();
		const projectedViewExtent = proj.transformExtent(geoViewExtent, 'EPSG:4326', viewProjection);
		this.fitToExtent(projectedViewExtent);
	}

	public addGeojsonLayer(data: GeoJSON.GeoJsonObject): void {
		let layer: VectorLayer = new VectorLayer({
			source: new Vector({
				features: new GeoJSON().readFeatures(data)
			})
		});
		this.mapObject.addLayer(layer);
	}

	public setAutoImageProcessing(shouldPerform: boolean = false): void {
		let imageLayer: ImageLayer = this._mapLayers.find((layer) => layer instanceof ImageLayer);
		if (!imageLayer) {
			return;
		}

		let rasterSource: Raster = <Raster>imageLayer.getSource();
		if (!rasterSource) {
			return;
		}

		if (shouldPerform) {
			// the determine the order which by the image processing will occur
			const processingParams = {
				Histogram: { auto: true },
				Sharpness: { auto: true }
			};
			this._imageProcessing.processUsingRaster(rasterSource, processingParams);
		} else {
			this._imageProcessing.removeAllRasterOperations(rasterSource);
		}
	}

	public setManualImageProcessing(processingParams: Object) {
		let imageLayer: ImageLayer = this._mapLayers.find((layer) => layer instanceof ImageLayer);
		if (!imageLayer) {
			return;
		}

		let rasterSource: Raster = <Raster>imageLayer.getSource();
		if (!rasterSource) {
			return;
		}
		this._imageProcessing.processUsingRaster(rasterSource, processingParams);
	}

	// *****-- click events --********
	public addSingleClickEvent() {
		this._flags.singleClickHandler = this.mapObject.on('singleclick', this.singleClickListener, this);
	}

	public removeSingleClickEvent() {
		this.mapObject.un('singleclick', this.singleClickListener, this);
	}

	public singleClickListener(e) {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLat = proj.toLonLat(e.coordinate, projection);
		this.singleClick.emit({ lonLat: lonLat });
	}


	// *****-- pointer move --********

	public onPointerMove(e) {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLat = proj.toLonLat(e.coordinate, projection);
		this.pointerMove.emit(lonLat);
	};

	public setPointerMove(enable: boolean) {
		// clear previous move listeners
		this.mapObject['un']('pointermove', this.onPointerMove, this);
		this.pointerMove = new EventEmitter<any>();

		if (enable) {
			this.mapObject.on('pointermove', this.onPointerMove, this);
		}
	}

	public getPointerMove() {
		return this.pointerMove;
	}

	// *****-- shadow mouse functionality end --********

	// *****-- tools ----*****


	// *****-- end tools ---****
	// IMap End
	public dispose() {

	}
}
