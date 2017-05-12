import { IMap } from '@ansyn/imagery';
import { Position } from '@ansyn/core';
/**
 * Created by AsafMasa on 25/04/2017.
 */
import * as ol from 'openlayers';
import { EventEmitter } from '@angular/core';

export class OpenLayerMap implements IMap {

	private _mapType: string;
	private _mapObject: ol.Map;
	private _mapLayers = [];
	private _mapVectorLayers = [];
	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<Position>;

	constructor(element: HTMLElement) {
		this._mapType = 'openLayers';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<Position>();
		this.initMap(element);
	}

	private initMap(element: HTMLElement) {
		const mapTileLayr = new ol.layer.Tile({
			source: new ol.source.OSM()
		});

		this._mapObject = new ol.Map({
			target: element,
			layers: [mapTileLayr],
			renderer: 'canvas',
			controls: [],
			view: new ol.View({
				center: ol.proj.fromLonLat([16, 38]),
				zoom: 12
			})
		});

		this._mapLayers.push(mapTileLayr);

		this._mapObject.on('moveend', (e) => {
			const center = this.getCenter();
			this.centerChanged.emit(center);
			this.positionChanged.emit(this.getPosition());
		});
	}

	// IMap Start

	public setLayer(layer: any) {
		this._mapLayers.forEach((existingLayer) => {
			this._mapObject.removeLayer(existingLayer);
		});

		this._mapLayers = [layer];
		this._mapObject.addLayer(layer);
	}

	public addLayer(layer: any) {
		this._mapLayers.push(layer);
		this._mapObject.addLayer(layer);
	}

	public addVectorLayer(layer: any): void {
		var vectorLayer = new ol.layer.Tile({
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
		this._mapVectorLayers[layer] = vectorLayer;		
	}

	public removeVectorLayer(layer: any): void {
		this._mapObject.removeLayer(this._mapVectorLayers[layer]);
		delete this._mapVectorLayers[layer];
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

	public setPosition(Position): void {
		this.mapObject.setView(new ol.View(<olx.ViewOptions>{
			center: ol.proj.fromLonLat(Position.center.coordinates),
			zoom: Position.zoom
		}));
	}

	public getPosition(): Position {
		window['OpenLayerMap'] = this;
		let center: GeoJSON.Point = this.getCenter();
		let zoom: number = this.mapObject.getView().getZoom();
		return { center, zoom };
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

	// IMap End
	public dispose() {

	}
}
