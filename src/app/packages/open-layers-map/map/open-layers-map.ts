/**
 * Created by AsafMasa on 25/04/2017.
 */

import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import * as ol from 'openlayers';
import { MapPosition } from '@ansyn/imagery/model/map-position';
//import { configuration } from './../../../../configuration/configuration';
import { Utils } from './utils';

export class OpenLayersMap implements IMap {

	public mapType: string;
	private _mapObject: ol.Map;
	private _mapLayers = [];
	private _mapVectorLayers = [];
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<MapPosition>;
	public pointerMove: EventEmitter<any>;
	public singleClick: EventEmitter<any>;

	private _shadowMouselayerId = 'shadowMouse';
	private _pinPointIndicatorLayerId = 'pinPointIndicator';
	private _flags = {
		pointerMoveListener: null,
		singleClickHandler: null
	};

	constructor(element: HTMLElement, layers: any, position?: MapPosition) {
		this.mapType = 'openLayersMap';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<MapPosition>();
		this.pointerMove = new EventEmitter<any>();
		this.singleClick = new EventEmitter<any>();

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
		this._mapObject = new ol.Map({
			target: element,
			layers: layers,
			renderer: 'canvas',
			controls: [],
			view: new ol.View({
				center: ol.proj.fromLonLat([center[0], center[1]]),
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
	}


	// IMap Start

	public setLayer(layer: any, extent?: GeoJSON.Point[]) {
		this.setMainLayer(layer);
		if (extent) {
			this.fitCurrentView(layer, extent);
		}
	}

	public getLayerById(id: string) {
		return this.mapObject.getLayers().getArray().filter(item => item.get('id') === id)[0];
	}

	private setMainLayer(layer: ol.layer.Layer) {
		const beforeArgs = this.internalBeforeSetMainLayer();
		this.removeAllLayers();

		const oldview = this._mapObject.getView();
		const currentZoom = oldview.getZoom();
		const currentCenter = oldview.getCenter();
		const currentRotation = oldview.getRotation();

		const projection = oldview.getProjection();
		let newCenter = ol.proj.transform([currentCenter[0], currentCenter[1]], projection, layer.getSource().getProjection());

		if (!newCenter) {
			newCenter = [0, 0];
		}

		const view: any = new ol.View({
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
		const pinPointIndicatorLayer: ol.layer.Layer = <ol.layer.Layer>this.getLayerById(this._pinPointIndicatorLayerId);
		let lonLatCords;
		if (pinPointIndicatorLayer) {
			let pinPointGeometry = (<any>pinPointIndicatorLayer).getSource().getFeatures()[0].getGeometry();
			const oldView = this._mapObject.getView();
			const oldViewProjection = oldView.getProjection();
			const layerCords = pinPointGeometry.getCoordinates();
			lonLatCords = ol.proj.transform(layerCords, oldViewProjection, 'EPSG:4326');
		}
		return { pinPointLonLatGeo: lonLatCords };
	}

	private internalAfterSetMainLayer(args: { pinPointLonLatGeo }) {
		if (args.pinPointLonLatGeo) {
			this.addPinPointIndicator(args.pinPointLonLatGeo);
		}
	}

	private fitCurrentView(layer: ol.layer.Layer, extent?: GeoJSON.Point[]) {
		const view = this._mapObject.getView();
		const viewProjection = view.getProjection();
		const layerExtent = layer.getExtent();
		let projectedViewExtent;

		if (layerExtent && extent) {
			const positionExtent = Utils.BoundingBoxToOLExtent(extent);
			projectedViewExtent = ol.proj.transformExtent(positionExtent, 'EPSG:4326', viewProjection);
			const intersects = ol.extent.intersects(layerExtent, projectedViewExtent);
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
			projectedViewExtent = ol.proj.transformExtent(positionExtent, 'EPSG:4326', viewProjection);
			this.fitToExtent(projectedViewExtent);
		}
	}

	private fitToExtent(extent: ol.Extent) {
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
		this._mapLayers.forEach((existingLayer) => {
			this.removeLayer(existingLayer);
		});

		this._mapLayers = [];
	}

	public removeLayer(layer: any): void {
		const index = this._mapLayers.indexOf(layer);
		if (index > -1) {
			this._mapLayers.splice(index, 1);
			this._mapObject.removeLayer(layer);
			this._mapObject.render();
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
		const vectorLayer = new ol.layer.Tile({
			source: new ol.source.OSM({
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
		const olCenter = ol.proj.transform([center.coordinates[0], center.coordinates[1]], 'EPSG:4326', projection);
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
		const transformedCenter = ol.proj.transform(center, projection, 'EPSG:4326');
		const geoPoint: GeoJSON.Point = {
			type: 'Point',
			coordinates: transformedCenter
		};
		return geoPoint;
	}

	public setPosition(position: MapPosition): void {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const olCenter = ol.proj.transform([position.center.coordinates[0], position.center.coordinates[1]], 'EPSG:4326', projection);
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
		const viewExtentGeo = ol.proj.transformExtent(viewExtent, viewProjection, 'EPSG:4326');
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
		const geoViewExtent: ol.Extent = Utils.BoundingBoxToOLExtent(bbox);
		const view = this._mapObject.getView();
		const viewProjection = view.getProjection();
		const projectedViewExtent = ol.proj.transformExtent(geoViewExtent, 'EPSG:4326', viewProjection);
		this.fitToExtent(projectedViewExtent);
	}

	public addGeojsonLayer(data: GeoJSON.GeoJsonObject): void {
		let layer: ol.layer.Vector = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: new ol.format.GeoJSON().readFeatures(data)
			})
		});
		this.mapObject.addLayer(layer);
	}

	public shouldPerformHistogram(shouldPerform: boolean): void {
		let imageLayer: ol.layer.Image = this._mapLayers.find((layer) => layer instanceof ol.layer.Image);
		let rasterSource: ol.source.Raster = <ol.source.Raster>imageLayer.getSource();

		if (shouldPerform) {
			rasterSource.setOperation(function (pixels, data) {
				let imageData = pixels[0];
				let histLut = buildHistogramLut(imageData);
				return performHistogram(imageData, histLut);
			}, {
				buildHistogramLut: buildHistogramLut,
				performHistogram: performHistogram,
				rgb2YCbCr: rgb2YCbCr,
				yCbCr2RGB: yCbCr2RGB
			});
		} else {
			rasterSource.setOperation(function (pixels, data) {
				return pixels[0];
			});
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
		const lonLat = ol.proj.toLonLat(e.coordinate, projection);
		this.singleClick.emit({ lonLat: lonLat });
	}


	public addPinPointIndicator(lonLat) {
		const layer = this.getLayerById(this._pinPointIndicatorLayerId);

		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLatCords = ol.proj.fromLonLat(lonLat, projection);
		if (layer) {
			layer.set('visible', true);
			const feature = (<any>layer).getSource().getFeatures()[0];
			feature.setGeometry(new ol.geom.Point(lonLatCords));
		}
		else {
			const feature = new ol.Feature({
				geometry: new ol.geom.Point(lonLatCords),
				id: 'pinPointIndicatorFeature'
			});

			const vectorLayer: ol.layer.Vector = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [feature]
				}),
				style: new ol.style.Style({
					image: new ol.style.Icon({
						scale: 1,
						src: '/assets/pinpoint_indicator.svg' //for further usage either bring from configuration or create svg
					})
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
		const lonLat = ol.proj.toLonLat(e.coordinate, projection);
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
		const lonLatCords = ol.proj.fromLonLat(lonLat, projection);
		feature.setGeometry(new ol.geom.Point(lonLatCords));
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
			const feature = new ol.Feature({
				id: 'shadowMousePosition'
			});

			const vectorLayer: ol.layer.Vector = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [feature]
				}),
				style: new ol.style.Style({
					image: new ol.style.Icon({
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

function rgb2YCbCr(rgb) {
    const y = 16 + 0.257 * rgb.r + 0.504 * rgb.g + 0.098 * rgb.b;
    const cb = 128 - 0.148 * rgb.r - 0.291 * rgb.g + 0.439 * rgb.b;
    const cr = 128 + 0.439 * rgb.r - 0.368 * rgb.g - 0.071 * rgb.b;

    return { y, cb, cr };
}

function yCbCr2RGB(yCbCr) {
    const yNorm = yCbCr.y - 16;
    const cbNorm = yCbCr.cb - 128;
    const crNorm = yCbCr.cr - 128;

    const r = 1.164 * yNorm + 0 * cbNorm + 1.596 * crNorm;
    const g = 1.164 * yNorm - 0.392 * cbNorm - 0.813 * crNorm;
    const b = 1.164 * yNorm + 2.017 * cbNorm + 0 * crNorm;

    return { r, g, b };
}

function buildHistogramLut(imageData) {
	const totalHistLut = [];
	
	for (let index = 16; index < 236; index++) {
		totalHistLut[index] = 0;
	}

    for (let index = 0; index < imageData.data.length; index += 4) {
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];

        const yCbCr = rgb2YCbCr({ r, g, b });

        const val = Math.floor(yCbCr.y);
        if (totalHistLut[val] === undefined) {
            totalHistLut[val] = 1;
        } else {
            totalHistLut[val] = totalHistLut[val] + 1;
        }
    }

    const cumulativeHist = [];

    cumulativeHist[16] = totalHistLut[16];

    for (let index = 17; index < totalHistLut.length; index++) {
        let tempTotalHist = totalHistLut[index] === undefined ? 0 : totalHistLut[index];
        cumulativeHist[index] = cumulativeHist[index - 1] + tempTotalHist;
    }

    let pixelsNum = 0;
    totalHistLut.forEach((hist) => pixelsNum += hist);

    const minCumProbability = cumulativeHist[16];
    const finalHist = [];

    for (let index = 16; index < cumulativeHist.length; index++) {
        const diff = cumulativeHist[index] - minCumProbability;

        finalHist[index] = Math.floor((diff / (pixelsNum - 1)) * (235 - 16 - 1) + 16);
    }

    return finalHist;
}

function performHistogram(imageData, histogramLut) {
    for (let index = 0; index < imageData.data.length; index += 4) {
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        const yCbCr = rgb2YCbCr({ r, g, b });

        yCbCr.y = histogramLut[Math.floor(yCbCr.y)];

        const rgb = this.yCbCr2RGB(yCbCr);

        imageData.data[index + 0] = rgb.r;	// Red
        imageData.data[index + 1] = rgb.g;	// Green
        imageData.data[index + 2] = rgb.b;	// Blue
        imageData.data[index + 3] = a;	// Alpha        
    }

    return imageData;
}
