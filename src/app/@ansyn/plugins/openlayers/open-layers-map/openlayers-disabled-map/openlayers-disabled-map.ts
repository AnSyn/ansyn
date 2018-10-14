import { Observable, of } from 'rxjs';
import * as ol from 'openlayers';
import Map from 'ol/map';
import View from 'ol/view';
import Layer from 'ol/layer/layer';
import { ICaseMapPosition } from '@ansyn/core';
import { GeoJsonObject, Point } from 'geojson';
import { BaseImageryMap, ImageryMap } from '@ansyn/imagery';
import * as olShared from '../shared/openlayers-shared';

export const DisabledOpenLayersMapName = 'disabledOpenLayersMap';

@ImageryMap({
	mapType: DisabledOpenLayersMapName
})
export class OpenLayersDisabledMap extends BaseImageryMap<Map> {
	mainLayer: Layer;

	initMap(element: HTMLElement, [mainLayer]: any, position?: ICaseMapPosition): Observable<boolean> {
		this.mapObject = new Map({
			target: element,
			renderer: 'canvas',
			controls: []
		});
		this.setMainLayer(mainLayer, position);
		return of(true);
	}

	addLayerIfNotExist(layer: any) {
	}

	toggleGroup(groupName: string, newState: boolean) {
	}

	getLayers(): any[] {
		return this.mapObject.getLayers().getArray();
	}

	public getCenter(): Observable<Point> {
		return of(null);
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return of(true);
	}


	resetView(layer: any, position?: ICaseMapPosition): Observable<boolean> {
		this.setMainLayer(layer, position);
		return of(true);
	}

	setMainLayer(layer: Layer, position?: ICaseMapPosition) {
		this.removeMainLayer();
		const view = this.generateNewView(layer, position);
		this.mapObject.setView(view);
		this.mainLayer = layer;
		this.mapObject.addLayer(this.mainLayer);
		const layerExtent = this.mainLayer.getExtent();
		if (layerExtent) {
			this.fitToMainLayerExtent(layerExtent);
		}
	}

	getMainLayer() {
		return this.mainLayer;
	}

	generateNewView(layer: Layer, position?: ICaseMapPosition): View {
		const newProjection = layer.getSource().getProjection();

		// for outside only
		if (position && position.projectedState.projection.code === newProjection.getCode()) {
			return new View({
				projection: newProjection,
				center: position.projectedState.center,
				zoom: position.projectedState.zoom,
				rotation: position.projectedState.rotation
			});
		}
		return new View({
			projection: newProjection
		});
	}

	fitToMainLayerExtent(extent: ol.Extent) {
		const view = this.mapObject.getView();
		view.fit(extent, {
			size: this.mapObject.getSize(),
			constrainResolution: false
		});
	}

	addLayer(layer: Layer): void {
		throw new Error('Can\'t find implementation');
	}

	removeMainLayer() {
		if (this.mainLayer) {
			this.removeLayer(this.mainLayer);
			this.mainLayer = null;
		}
	}

	removeLayer(layer: any): void {
		olShared.removeWorkers(layer);
		this.mapObject.removeLayer(layer);
		this.mapObject.renderSync();
	}

	setPosition(position: ICaseMapPosition): Observable<boolean> {
		return of(true);
	}

	getPosition(): Observable<ICaseMapPosition> {
		return of(undefined);
	}

	setRotation(rotation: number): void {
	}

	updateSize(): void {
		this.mapObject.updateSize();
	}

	addGeojsonLayer(data: GeoJsonObject): void {
	}

	setPointerMove(enable: boolean) {
	}

	getPointerMove() {
		return new Observable();
	}

	getRotation(): number {
		return NaN;
	}

	dispose() {
		if (this.mapObject) {
			this.removeMainLayer();
			this.mapObject.setTarget(null);
		}
	}
}
