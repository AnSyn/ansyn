import { IMap } from '@ansyn/imagery';
/**
 * Created by AsafMasa on 25/04/2017.
 */
import * as ol from 'openlayers';
import {EventEmitter} from '@angular/core';

export class OpenLayerMap implements IMap {

	private _mapType: string;
	private _mapObject: ol.Map;
	private mapTileLayr: ol.layer.Tile;

	public centerChanged: EventEmitter<GeoJSON.Point>;

	constructor(element: HTMLElement) {
		this._mapType = 'openLayers';
		this.centerChanged = new EventEmitter<GeoJSON.Point>();
		this.initMap(element);
	}

	private initMap(element: HTMLElement) {
		this.mapTileLayr = new ol.layer.Tile({
			source: new ol.source.OSM()
		});

		this._mapObject = new ol.Map({
			target: element,
			layers: [this.mapTileLayr],
			renderer: 'canvas',
			controls: [],
			view: new ol.View({
				center: ol.proj.fromLonLat([16, 38]),
				zoom: 12
			})
		});

		this._mapObject.on('moveend', (e) => {
			const center = this.getCenter();
			this.centerChanged.emit(center);
		});
	}

	// IMap Start

	public get mapObject() {
		return this._mapObject;
	}

	public get mapType(){
		return this._mapType;
	}

	public set mapType(value){
		this._mapType = value;
	}

	public setCenter(center: GeoJSON.Point) {
		const projection = this._mapObject.getView().getProjection();
		const olCenter = ol.proj.transform([center.coordinates[0], center.coordinates[1]], 'EPSG:4326', projection);
		this.flyTo(olCenter);
	}

	public getCenter(): GeoJSON.Point {
		const projection = this._mapObject.getView().getProjection();
		const center = this._mapObject.getView().getCenter();
		const transformedCenter = ol.proj.transform([center[0], center[1]], projection, 'EPSG:4326');
		const geoPoint: GeoJSON.Point = {
			type: 'Point',
			coordinates: transformedCenter
		};
		return geoPoint;
	}

	private flyTo(location) {
		const view = this._mapObject.getView();
		view.animate({
			center: location,
			duration: 2000
		});
	}

	public setBoundingRectangle(rect: GeoJSON.MultiPolygon) {
		// let olView = this._mapObject.getView();
		// let extenta = olView.calculateExtent(this._mapObject.getSize());
		// extenta[0] += 1000;
		// this.mapTileLayr.setExtent(extenta);
		// console.log(`extent: ${JSON.stringify(extenta)}`);
		// //[minx, miny, maxx, maxy].
	}
	// IMap End
	public dispose() {

	}
}
