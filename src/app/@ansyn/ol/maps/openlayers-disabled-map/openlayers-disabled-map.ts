import {
	BaseImageryMap, ICanvasExportData,
	IMAGERY_MAIN_LAYER_NAME,
	ImageryLayerProperties,
	ImageryMap,
	ImageryMapPosition
} from '@ansyn/imagery';
import { GeoJsonObject, Point } from 'geojson';
import Layer from 'ol/layer/Layer';
import Map from 'ol/Map';
import View from 'ol/View';
import { Observable, of } from 'rxjs';
import * as olShared from '../open-layers-map/shared/openlayers-shared';

export const DisabledOpenLayersMapName = 'disabledOpenLayersMap';

@ImageryMap({
	mapType: DisabledOpenLayersMapName
})
export class OpenLayersDisabledMap extends BaseImageryMap<Map> {
	mainLayer: Layer;
	element: HTMLElement;

	initMap(element: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, mainLayer: any, position?: ImageryMapPosition): Observable<boolean> {
		this.element = element;
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


	resetView(layer: any, position?: ImageryMapPosition): Observable<boolean> {
		this.setMainLayer(layer, position);
		return of(true);
	}

	setMainLayer(layer: Layer, position?: ImageryMapPosition) {
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

	generateNewView(layer: Layer, position?: ImageryMapPosition): View {
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

	fitToMainLayerExtent(extent: [number, number, number, number]) {
		const view = this.mapObject.getView();
		view.fit(extent, {
			size: this.mapObject.getSize(),
			constrainResolution: false
		});
	}

	addLayer(layer: Layer): void {
		this.mapObject.addLayer(layer);
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

	setPosition(position: ImageryMapPosition): Observable<boolean> {
		return of(true);
	}

	getPosition(): Observable<ImageryMapPosition> {
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

	getRotation(): number {
		return this.mapObject.getView().getRotation();
	}

	getCoordinateFromScreenPixel(screenPixel: { x, y }): [number, number, number] {
		return null;
	}

	getHtmlContainer(): HTMLElement {
		return <HTMLElement>this.element;
	}

	getExportData(): ICanvasExportData {
		const c = this.mapObject.getViewport().firstChild;
		let exportData: ICanvasExportData = {
			width: c.width,
			height: c.height,
			data: 'data:image/png;base64,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'
		};
		try {
			exportData = {
				width: c.width,
				height: c.height,
				data: c.toDataURL()
			}
		}catch (e) {
		}
		return exportData;
	}

	dispose() {
		if (this.mapObject) {
			this.removeMainLayer();
			this.mapObject.setTarget(null);
		}
	}
}
