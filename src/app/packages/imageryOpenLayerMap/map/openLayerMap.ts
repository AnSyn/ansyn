/**
 * Created by AsafMasa on 25/04/2017.
 */

import { IMap } from '@ansyn/imagery';
import { Position } from '@ansyn/core';
import { EventEmitter } from '@angular/core';
import * as ol from 'openlayers';
import { Extent } from '@ansyn/imagery';
    
export class OpenLayerMap implements IMap {

    private _mapType: string;
    private _mapObject: ol.Map;
    private _mapLayers = [];
    private _mapVectorLayers = [];
    public centerChanged: EventEmitter < GeoJSON.Point > ;
    public positionChanged: EventEmitter < Position > ;

	constructor(element: HTMLElement, layers: any, position?: Position) {
        this._mapType = 'openLayerMap';
        this.centerChanged = new EventEmitter < GeoJSON.Point > ();
        this.positionChanged = new EventEmitter < Position > ();
		this.initMap(element, layers, position);
    }

	private initMap(element: HTMLElement, layers: any,  position?: Position) {

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
				center: ol.proj.fromLonLat([center[0],center[1]]),
				zoom: zoom,
				rotation: rotation
            })
        });

        this._mapLayers = layers;

        this._mapObject.on('moveend', (e) => {
			const mapCenter = this.getCenter();
			this.centerChanged.emit(mapCenter);
            this.positionChanged.emit(this.getPosition());
        });
    }

    // IMap Start

	public setLayer(layer: any, extent?: Extent) {
		this.setMainLayer(layer);
		this.fitCurrentView(layer, extent);
	}

	private setMainLayer(layer: ol.layer.Layer) {
		// TODO: check about other layers (interaction etc.)
		//this._mapObject.getLayers().clear();
        this._mapLayers.forEach((existingLayer) => {
            this._mapObject.removeLayer(existingLayer);
        });
		this._mapLayers = [];

		const currentZoom = this._mapObject.getView().getZoom();
		const currentCenter = this._mapObject.getView().getCenter();
		const currentRotation = this._mapObject.getView().getRotation();

		const projection = this._mapObject.getView().getProjection();
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
	}

	private fitCurrentView(layer: ol.layer.Layer, extent?: Extent) {
		const view = this._mapObject.getView();
		const layerExtent = layer.getExtent();
		if (layerExtent) {
			view.setCenter(ol.extent.getCenter(layerExtent));
			view.fit(layerExtent, {
				size: this._mapObject.getSize(),
				constrainResolution: false
			});
		}
		else if (extent) {
			const layerProjection = layer.getSource().getProjection();
			const topLeft = ol.proj.transform([extent.topLeft[0],extent.topLeft[1]], 'EPSG:4326', layerProjection);
			const topRight = ol.proj.transform([extent.topRight[0],extent.topRight[1]], 'EPSG:4326', layerProjection);
			const bottomLeft = ol.proj.transform([extent.bottomLeft[0],extent.bottomLeft[1]], 'EPSG:4326', layerProjection);
			const bottomRight = ol.proj.transform([extent.bottomRight[0],extent.bottomRight[1]], 'EPSG:4326', layerProjection);
			const viewExtent = ol.extent.boundingExtent([topLeft, topRight, bottomLeft, bottomRight]);
			view.fit(viewExtent, {
				size: this._mapObject.getSize(),
				constrainResolution: false
			});
		}
    }

    public addLayer(layer: any) {
        this._mapLayers.push(layer);
        this._mapObject.addLayer(layer);
    }

	public removeLayer(layer: any): void {
		const index = this._mapLayers.indexOf(layer);
		if (index > -1) {
			this._mapLayers.splice(layer);
			this._mapObject.removeLayer(layer);
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

    public get mapType() {
        return this._mapType;
    }

    public set mapType(value) {
        this._mapType = value;
    }

    public setCenter(center: GeoJSON.Point, animation: boolean) {
        const projection = this._mapObject.getView().getProjection();
        const olCenter = ol.proj.transform([center.coordinates[0], center.coordinates[1]], 'EPSG:4326', projection);
        if (animation) {
            this.flyTo(olCenter);
        } else {
            this._mapObject.getView().setCenter(olCenter);
        }
    }

    public updateSize(): void {
        this._mapObject.updateSize();
    }

    public getCenter(): GeoJSON.Point {
        const projection = this._mapObject.getView().getProjection();
        const center = this._mapObject.getView().getCenter();
        const transformedCenter = ol.proj.transform(center, projection, 'EPSG:4326');
        const geoPoint: GeoJSON.Point = {
            type: 'Point',
            coordinates: transformedCenter
        };
        return geoPoint;
    }

	public setPosition(position: Position): void {
        this.mapObject.setView(new ol.View( < olx.ViewOptions > {
			center: ol.proj.fromLonLat(<[number, number]>position.center.coordinates),
			zoom: position.zoom,
			rotation: position.rotation
        }));
    }

    public getPosition(): Position {
        window['OpenLayerMap'] = this; //why ?????? and what if someone will do window.OpenLayerMap = null ,
        let center: GeoJSON.Point = this.getCenter();
        let zoom: number = this.mapObject.getView().getZoom();
		let rotation: number = this.mapObject.getView().getRotation();
		return { center, zoom , rotation};
    }

    private flyTo(location) {
        const view = this._mapObject.getView();
        view.animate({
            center: location,
            duration: 2000
        });
    }

    public setBoundingRectangle(rect: GeoJSON.MultiPolygon) {

    }

    public addGeojsonLayer(data: GeoJSON.GeoJsonObject): void {
        let layer: ol.layer.Vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: new ol.format.GeoJSON().readFeatures(data)
            })
        });
        this.mapObject.addLayer(layer);
    }

    public togglePointerMove(){

    }

    // IMap End
    public dispose() {

    }
}
