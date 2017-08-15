/**
 * Created by AsafMasa on 25/04/2017.
 */

import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { MapPosition } from '@ansyn/imagery/model/map-position';
import { Utils } from './utils';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';

import Map from 'ol/map';
import View from 'ol/view';
import Extent from 'ol/extent';
import proj from 'ol/proj';

import Feature from 'ol/feature';
import GeoJSON from 'ol/format/geojson';
import Point from 'ol/geom/point';

import Style from 'ol/style/style';
import Icon from 'ol/style/icon';

import Vector from 'ol/source/vector';
import Raster from 'ol/source/raster';
import OSM from 'ol/source/osm';

import Layer from 'ol/layer/layer';
import TileLayer from 'ol/layer/tile';
import ImageLayer from 'ol/layer/image';
import VectorLayer from 'ol/layer/vector';

import Collection from 'ol/collection';


export class OpenLayersMap implements IMap {

	public mapType: string;
	private _mapObject: Map;
	private _mapLayers = [];
	private _mapVectorLayers = [];
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<MapPosition>;
	public pointerMove: EventEmitter<any>;
	public singleClick: EventEmitter<any>;
	public contextMenu: EventEmitter<any>;

	private _shadowMouselayerId = 'shadowMouse';
	private _pinPointIndicatorLayerId = 'pinPointIndicator';
	private _flags = {
		pointerMoveListener: null,
		singleClickHandler: null
	};

	private _imageProcessing: OpenLayersImageProcessing;

	constructor(element: HTMLElement, layers: any, position?: MapPosition) {
		this.mapType = 'openLayersMap';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.pointerMove = new EventEmitter<any>();
		this.singleClick = new EventEmitter<any>();
		this.contextMenu = new EventEmitter<any>();
		this._imageProcessing = new OpenLayersImageProcessing();

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
		this._mapObject = new Map({
			target: element,
			layers: layers,
			renderer: 'canvas',
			controls: [],
			view: new View({
				center: proj.fromLonLat([center[0], center[1]]),
				zoom: zoom,
				rotation: rotation
			})
		});

		this._mapLayers = layers;

		if (position && position.boundingBox) {
			this.setBoundingBox(position.boundingBox);
		}

		this._mapObject.on('moveend', (e) => {
			const mapCenter = this.getCenter();
			this.centerChanged.emit(mapCenter);
			this.positionChanged.emit(this.getPosition());
		});

		const containerElem = <HTMLElement> this._mapObject.getViewport();

		containerElem.addEventListener('contextmenu', (e: MouseEvent) => {
			e.preventDefault();
			const view = this._mapObject.getViewport();
			let coordinates = this._mapObject.getCoordinateFromPixel([e.layerX, e.layerY]);
			const projection = this._mapObject.getView().getProjection();
			coordinates = proj.transform(coordinates, projection, 'EPSG:4326');
			const point: GeoJSON.Point = {type: 'Point', coordinates};
			containerElem.click();
			this.contextMenu.emit({point, view, e});
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
		const beforeArgs = this.internalBeforeSetMainLayer();
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
			projection: layer.getSource().getProjection()
		});

		this._mapObject.setView(view);
		this.addLayer(layer);

		this.internalAfterSetMainLayer(beforeArgs);
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

	private internalAfterSetMainLayer(args: { pinPointLonLatGeo }) {
		if (args.pinPointLonLatGeo) {
			this.addPinPointIndicator(args.pinPointLonLatGeo);
		}
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

	public removeAllLayers() {
		while (this._mapLayers.length > 0) {
			this.removeLayer(this._mapLayers[0]);
		}

		this._mapLayers = [];
	}

	public removeLayer(layer: any): void {
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
			//layer.set('visible',false);
			this.removeLayer(layer);
		}
	}

	// In the future we'll use @ansyn/map-source-provider
	public addVectorLayer(layer: any): void {
		const vectorLayer = new TileLayer({
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
		const geoPoint: GeoJSON.Point = {
			type: 'Point',
			coordinates: transformedCenter
		};
		return geoPoint;
	}

	public setPosition(position: MapPosition): void {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const olCenter = proj.transform([position.center.coordinates[0], position.center.coordinates[1]], 'EPSG:4326', projection);
		view.setCenter(olCenter);
		view.setRotation(position.rotation);
		view.setZoom(position.zoom);
		if (position.boundingBox) {
			this.setBoundingBox(position.boundingBox);
		}
	}

	public getPosition(): MapPosition {
		const view = this._mapObject.getView();
		let center: GeoJSON.Point = this.getCenter();
		let zoom: number = view.getZoom();
		let rotation: number = view.getRotation();
		let boundingBox = this.getMapExtentInGeo();

		const result: MapPosition = { center, zoom, rotation, boundingBox };
		//if(configuration.General.logActions ){
		//	console.log(`'Get Map Extent : ${JSON.stringify(boundingBox)}'`);
		//}
		return result;
	}

	private getMapExtentInGeo() {
		const view = this._mapObject.getView();
		const viewProjection = view.getProjection();
		const viewExtent = view.calculateExtent(this._mapObject.getSize());
		const viewExtentGeo = proj.transformExtent(viewExtent, viewProjection, 'EPSG:4326');
		const bbox = Utils.OLExtentToBoundingBox(viewExtentGeo);
		return bbox;
	}

	private flyTo(location) {
		const view = this._mapObject.getView();
		view.animate({
			center: location,
			duration: 2000
		});
	}

	public setBoundingBox(bbox: GeoJSON.Point[]) {
		//if(configuration.General.logActions ){
		//	console.log(`'Set Map extent to: ${JSON.stringify(bbox)}'`);
		//}
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
			this._imageProcessing.addOperation(rasterSource, 'Sharpness');
			this._imageProcessing.addOperation(rasterSource, 'Histogram');
		} else {
			this._imageProcessing.removeAllRasterOperations(rasterSource);
		}
	}

	//*****--pin point paint on the map--********
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


	public addPinPointIndicator(lonLat) {
		const layer = this.getLayerById(this._pinPointIndicatorLayerId);

		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLatCords = proj.fromLonLat(lonLat, projection);
		if (layer) {
			layer.set('visible', true);
			const feature = (<any>layer).getSource().getFeatures()[0];
			feature.setGeometry(new Point(lonLatCords));
		}
		else {
			const feature = new Feature({
				geometry: new Point(lonLatCords),
				id: 'pinPointIndicatorFeature'
			});

			const featuresCollection = new Collection([feature]);

			const iconStyle = new Icon({
				scale: 1,
				src: '/assets/pinpoint_indicator.svg' //for further usage either bring from configuration or create svg
			});

			const vectorLayer: VectorLayer = new VectorLayer({
				source: new Vector({
					features: featuresCollection
				}),
				style: new Style({
					image: iconStyle
				})
			});

			vectorLayer.setZIndex(12000);
			vectorLayer.set('id', this._pinPointIndicatorLayerId);

			this.addLayer(vectorLayer);
		}
	}

	public removePinPointIndicator() {
		this.removeLayerById(this._pinPointIndicatorLayerId);
	}
	//*****-- pin point paint on the map end --********

	//*****-- shadow mouse functionality--********

	public onPointerMove(e) {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLat = proj.toLonLat(e.coordinate, projection);
		this.pointerMove.emit(lonLat);
	};

	public drawShadowMouse(lonLat) {
		const layer = this.getLayerById(this._shadowMouselayerId);
		if (!layer) {
			return;
		}
		const feature = (<any>layer).getSource().getFeatures()[0];
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLatCords = proj.fromLonLat(lonLat, projection);
		feature.setGeometry(new Point(lonLatCords));
		this.mapObject.render();
	}

	public togglePointerMove() {
		if (!this._flags.pointerMoveListener) {

			this._flags.pointerMoveListener = this.mapObject.on('pointermove', this.onPointerMove, this);
		}
		else {
			this.mapObject['un']('pointermove', this.onPointerMove, this);
			this._flags.pointerMoveListener = false;
		}
	}

	public startMouseShadowVectorLayer() {
		const layer = this.getLayerById(this._shadowMouselayerId);

		if (layer) {
			layer.set('visible', true);
		}
		else {
			const feature = new Feature({
				id: 'shadowMousePosition'
			});

			const vectorLayer: VectorLayer = new VectorLayer({
				source: new Vector({
					features: [feature]
				}),
				style: new Style({
					image: new Icon({
						scale: 0.05,
						src: '/assets/2877.png' //for further usage either bring from configuration or create svg
					})
				})
			});

			vectorLayer.setZIndex(12000);
			vectorLayer.set('id', this._shadowMouselayerId);
			this.addLayer(vectorLayer);
		}
	}

	public stopMouseShadowVectorLayer() {
		this.removeLayerById(this._shadowMouselayerId);
	}

	//*****-- shadow mouse functionality end --********

	//*****-- tools ----*****



	//*****-- end tools ---****
	// IMap End
	public dispose() {

	}
}
