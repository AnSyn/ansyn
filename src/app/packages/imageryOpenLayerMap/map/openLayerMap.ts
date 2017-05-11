import { IMap, IPosition } from '@ansyn/imagery';
/**
 * Created by AsafMasa on 25/04/2017.
 */
import * as ol from 'openlayers';
import {EventEmitter} from '@angular/core';

export class OpenLayerMap implements IMap {

	private _mapType: string;
	private _mapObject: ol.Map;
	private _mapLayers = [];

	public centerChanged: EventEmitter<GeoJSON.Point>;
	public positionChanged: EventEmitter<IPosition>;

	constructor(element: HTMLElement) {
		this._mapType = 'openLayers';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.positionChanged = new EventEmitter<IPosition>();
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

	public get mapObject() {
		return this._mapObject;
	}

	public get mapType(){
		return this._mapType;
	}

	public set mapType(value){
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

	public setPosition(IPosition): void {
		this.mapObject.setView(new ol.View(<olx.ViewOptions>{
			center: ol.proj.fromLonLat(IPosition.center.coordinates),
			zoom: IPosition.zoom
		}));
	}

	public getPosition(): IPosition {
		window['OpenLayerMap'] = this;
		let center: GeoJSON.Point = this.getCenter();
		let zoom: number = this.mapObject.getView().getZoom();
		return {center, zoom};
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
