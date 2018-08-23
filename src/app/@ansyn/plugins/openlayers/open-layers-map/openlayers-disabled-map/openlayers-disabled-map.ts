import { Observable, of } from 'rxjs';
import * as ol from 'openlayers';
import Map from 'ol/map';
import View from 'ol/view';
import ScaleLine from 'ol/control/scaleline';
import Layer from 'ol/layer/layer';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { GeoJsonObject, Point } from 'geojson';
import { ImageryMap } from '@ansyn/imagery/decorators/imagery-map';
import { BaseImageryMap } from '@ansyn/imagery/model/base-imagery-map';

export const DisabledOpenLayersMapName = 'disabledOpenLayersMap';

@ImageryMap({
	mapType: DisabledOpenLayersMapName
})
export class OpenLayersDisabledMap extends BaseImageryMap<Map> {
	mainLayer: Layer;

	initMap(element: HTMLElement, layers: any, position?: ICaseMapPosition): Observable<boolean> {
		this.mapObject = new Map({
			target: element,
			renderer: 'canvas',
			controls: [/*new ScaleLine()*/]
		});
		this.setMainLayer(layers[0], position);
		return Observable.of(true);
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
		return Observable.of(true);
	}


	resetView(layer: any, position?: ICaseMapPosition): Observable<boolean> {
		this.setMainLayer(layer, position);
		return Observable.of(true);
	}

	setMainLayer(layer: Layer, position?: ICaseMapPosition) {
		if (this.mainLayer) {
			this.mapObject.removeLayer(this.mainLayer);
			this.mapObject.render();
		}

		this.mainLayer = layer;
		const view = this.generateNewView(layer, position);
		this.mapObject.setView(view);
		this.addLayer(this.mainLayer);
		const layerExtent = this.mainLayer.getExtent();
		if (layerExtent) {
			this.fitToMainLayerExtent(layerExtent);
		}
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
		this.mapObject.addLayer(layer);
	}

	removeLayer(layer: any): void {
	}

	setPosition(position: ICaseMapPosition): Observable<boolean> {
		return Observable.of(true);
	}

	getPosition(): Observable<ICaseMapPosition> {
		return Observable.of(undefined);
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

	}
}
