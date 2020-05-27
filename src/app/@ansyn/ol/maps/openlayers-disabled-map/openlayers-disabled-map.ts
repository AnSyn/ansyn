import {
	BaseImageryMap,
	IMAGERY_MAIN_LAYER_NAME,
	ImageryLayerProperties,
	ImageryMap,
	IImageryMapPosition,
	EPSG_4326
} from '@ansyn/imagery';
import { GeoJsonObject, Point } from 'geojson';
import ol_Layer from 'ol/layer/Layer';
import Map from 'ol/Map';
import View from 'ol/View';
import { Observable, of } from 'rxjs';
import * as olShared from '../open-layers-map/shared/openlayers-shared';

export const DisabledOpenLayersMapName = 'disabledOpenLayersMap';

@ImageryMap({
	mapType: DisabledOpenLayersMapName
})
export class OpenLayersDisabledMap extends BaseImageryMap<Map> {
	mainLayer: ol_Layer;
	element: HTMLElement;

	initMap(element: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, mainLayer: ol_Layer, position?: IImageryMapPosition): Observable<boolean> {
		this.element = element;
		this.mapObject = new Map({
			target: element,
			renderer: 'canvas',
			controls: []
		});
		this.setMainLayer(mainLayer, position);
		return of(true);
	}

	addLayerIfNotExist(layer: ol_Layer) {
	}

	toggleGroup(groupName: string, newState: boolean) {
	}

	getLayers(): ol_Layer[] {
		return this.mapObject.getLayers().getArray();
	}

	public getCenter(): Observable<Point> {
		return of(null);
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return of(true);
	}


	resetView(layer: ol_Layer, position?: IImageryMapPosition): Observable<boolean> {
		this.setMainLayer(layer, position);
		return of(true);
	}

	setMainLayer(layer: ol_Layer, position?: IImageryMapPosition) {
		this.removeMainLayer();
		const view = this.generateNewView(layer, position);
		this.mapObject.setView(view);
		this.mainLayer = layer;
		this.mainLayer.set(ImageryLayerProperties.NAME, IMAGERY_MAIN_LAYER_NAME);
		this.mapObject.addLayer(this.mainLayer);
		const layerExtent = this.mainLayer.getExtent();
		if (layerExtent) {
			this.fitToMainLayerExtent(layerExtent);
		}
	}

	getMainLayer() {
		return this.mainLayer;
	}

	generateNewView(layer: ol_Layer, position?: IImageryMapPosition): View {
		const newProjection = layer.getSource().getProjection();

		// for outside only
		if (position && position.projectedState && position.projectedState.projection.code === newProjection.getCode()) {
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

	fitToMainLayerExtent(extent: [number, number, number, number]) {
		const view = this.mapObject.getView();
		view.fit(extent, {
			size: this.mapObject.getSize(),
			constrainResolution: false
		});
	}

	addLayer(layer: ol_Layer): void {
		this.mapObject.addLayer(layer);
	}

	removeMainLayer() {
		if (this.mainLayer) {
			this.removeLayer(this.mainLayer);
			this.mainLayer = null;
		}
	}

	removeLayer(layer: ol_Layer): void {
		olShared.removeWorkers(layer);
		this.mapObject.removeLayer(layer);
		this.mapObject.renderSync();
	}

	setPosition(position: IImageryMapPosition): Observable<boolean> {
		return of(true);
	}

	getPosition(): Observable<IImageryMapPosition> {
		return of(undefined);
	}

	public setRotation(rotation: number, view: View = this.mapObject.getView()) {
		view.setRotation(rotation);
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

	one2one(): void {
		const view = this.mapObject.getView();
		view.setResolution(1)
	}

	zoomOut(): void {
		const view = this.mapObject.getView();
		const current = view.getZoom();
		view.setZoom(current - 1);
	}

	zoomIn(): void {
		const view = this.mapObject.getView();
		const current = view.getZoom();
		view.setZoom(current + 1);
	}

	getRotation(): number {
		return this.mapObject.getView().getRotation();
	}

	getCoordinateFromScreenPixel(screenPixel: { x, y }): [number, number, number] {
		return null;
	}

	getHtmlContainer(): HTMLElement {
		return <HTMLElement>this.element;
	}

	getProjectionCode(): string {
		return EPSG_4326;
	}

	dispose() {
		if (this.mapObject) {
			this.removeMainLayer();
			this.mapObject.setTarget(null);
		}
	}
}
