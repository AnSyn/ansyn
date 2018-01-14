import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { CaseMapPosition, ICaseResolutionData } from '@ansyn/core';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';
import { CaseMapExtent } from '@ansyn/core/models/case-map-position.model';
import OLMap from 'ol/map';
import View from 'ol/view';
import proj from 'ol/proj';
import ScaleLine from 'ol/control/scaleline';
import Group from 'ol/layer/group';
import GeoJSON from 'ol/format/geojson';
import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import Raster from 'ol/source/raster';
import OSM from 'ol/source/osm';
import Layer from 'ol/layer/layer';
import TileLayer from 'ol/layer/tile';
import ImageLayer from 'ol/layer/image';
import VectorLayer from 'ol/layer/vector';

export class OpenLayersMap extends IMap<OLMap> {
	static mapType = 'openLayersMap';

	static groupLayers = new Map<string, Group>();

	private showGroups = new Map<string, boolean>();
	public mapType: string = OpenLayersMap.mapType;
	private _mapObject: OLMap;
	protected resolutionDelta = 25;
	public centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	public positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	public pointerMove: EventEmitter<any> = new EventEmitter<any>();
	public singleClick: EventEmitter<any> = new EventEmitter<any>();
	public contextMenu: EventEmitter<any> = new EventEmitter<any>();

	private _flags = {
		singleClickHandler: null
	};

	private _imageProcessing: OpenLayersImageProcessing;

	static addGroupLayer(layer: any, groupName: string) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (!group) {
			throw new Error('Tried to add a layer to a non-existent group');
		}

		group.getLayers().getArray().push(layer);
	}

	static removeGroupLayer(layer: any, groupName: string) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (!group) {
			throw new Error('Tried to add a layer to a non-existent group');
		}

		const layersArray: any[] = group.getLayers().getArray();
		let removeLayer = layersArray.indexOf(layersArray.filter(l => l.id === layer.id));
		group.getLayers().getArray().splice(removeLayer, 1);
	}

	static addGroupVectorLayer(layer: any, groupName: string) {
		const vectorLayer = new TileLayer({
			zIndex: 1,
			source: new OSM({
				attributions: [
					layer.name
				],
				opaque: false,
				url: layer.url,
				crossOrigin: null
			})
		});
		vectorLayer.id = layer.id;

		OpenLayersMap.addGroupLayer(vectorLayer, groupName);
	}

	constructor(element: HTMLElement, private _mapLayers = [], position?: CaseMapPosition) {
		super();

		if (!OpenLayersMap.groupLayers.get('layers')) {
			OpenLayersMap.groupLayers.set('layers', new Group({
				layers: [],
				name: 'layers'
			}));
		}

		this.showGroups.set('layers', true);

		this.initMap(element, _mapLayers, position);
	}

	public positionToPoint(x, y): GeoJSON.Point {
		let coordinates = this._mapObject.getCoordinateFromPixel([x, y]);
		const projection = this._mapObject.getView().getProjection();
		coordinates = proj.toLonLat(coordinates, projection);
		return { type: 'Point', coordinates };
	}

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition) {
		const [mainLayer] = layers;
		const view = this.createView(mainLayer);

		this._mapObject = new OLMap({
			target: element,
			layers,
			renderer: 'canvas',
			controls: [new ScaleLine()],
			view
		});

		this.setPosition(position);
		this.initListeners();
		this.setGroupLayers();
	}

	initListeners() {
		this._mapObject.on('moveend', () => {
			const mapCenter = this.getCenter();
			this.centerChanged.emit(mapCenter);
			this.positionChanged.emit(this.getPosition());
		});

		const containerElem = <HTMLElement> this._mapObject.getViewport();

		containerElem.addEventListener('contextmenu', (e: MouseEvent) => {
			e.preventDefault();

			containerElem.click();

			const point = this.positionToPoint(e.offsetX, e.offsetY);
			this.contextMenu.emit({ point, e });
		});
	}

	createView(layer): View {
		return new View({
			projection: layer.getSource().getProjection(),
			minZoom: 2.5
		});
	}

	public resetView(layer: any, position: CaseMapPosition, extent?: CaseMapExtent) {
		const view = this.createView(layer);
		this.setMainLayer(layer);
		this._mapObject.setView(view);

		if (extent) {
			this.fitToExtent(extent);
		} else {
			this.setPosition(position);
		}
	}

	public getLayerById(id: string) {
		return this.mapObject.getLayers().getArray().filter(item => item.get('id') === id)[0];
	}

	setGroupLayers() {
		this.showGroups.forEach((show, group) => {
			if (show) {
				this.addLayer(OpenLayersMap.groupLayers.get(group));
			}
		});
	}

	toggleGroup(groupName: string) {
		const newState = !this.showGroups.get(groupName);
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (newState) {
			this.addLayer(group);
		} else {
			this._mapObject.removeLayer(group);
		}
		this.showGroups.set(groupName, newState);
	}

	setMainLayer(layer: Layer) {
		this.removeAllLayers();
		this.addLayer(layer);

		if (layer.getSource() instanceof Raster) {
			this._imageProcessing = new OpenLayersImageProcessing(layer.getSource());
		} else {
			this._imageProcessing = null;
		}

		this.setGroupLayers();
	}

	fitToExtent(extent: CaseMapExtent, view: View = this.mapObject.getView()) {
		const projection = view.getProjection();
		const transformExtent = proj.transformExtent(extent, 'EPSG:4326', projection);
		view.fit(transformExtent, { nearest: true});
	}

	public addLayer(layer: any) {
		this._mapLayers.push(layer);
		this._mapObject.addLayer(layer);
	}

	/**
	 * add layer to the map if it is not already exists the layer must have an id set
	 * @param layer
	 */
	public addLayerIfNotExist(layer): Layer {
		const layerId = layer.get('id');
		if (!layerId) {
			return;
		}
		const existingLayer = this.getLayerById(layerId);
		if (!existingLayer) {
			// layer.set('visible',false);
			this.addLayer(layer);
			return layer;
		}
		return existingLayer;
	}

	public removeAllLayers() {
		this.showGroups.forEach((show, group) => {
			if (show) {
				this._mapObject.removeLayer(OpenLayersMap.groupLayers.get(group));
			}
		});

		while (this._mapLayers.length > 0) {
			this.removeLayer(this._mapLayers[0]);
		}

		this._mapLayers = [];
	}

	public removeLayer(layer: any): void {
		if (!layer) {
			return;
		}

		const index = this._mapLayers.indexOf(layer);
		if (index > -1) {
			this._mapLayers.splice(index, 1);
			this._mapObject.removeLayer(layer);
			this._mapObject.render();
		}

		if (this._imageProcessing) {
			this._imageProcessing.processImage(null);
		}
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
		return {
			type: 'Point',
			coordinates: transformedCenter
		};
	}

	public setPosition(position: CaseMapPosition, view: View = this.mapObject.getView()): void {
		const viewProjection = view.getProjection();
		const isProjectedPosition = viewProjection.getCode() === position.projectedState.projection.code;
		const { extent, projectedState } = position;
		const { center, rotation, zoom } = projectedState;
		if (isProjectedPosition) {
			view.setCenter(center);
			view.setZoom(zoom);
		}
		// else if (position.resolutionData) {
		// 	const projectedCenter = proj.transform(position.resolutionData.center, 'EPSG:4326', viewProjection);
		// 	view.setCenter(projectedCenter);
		// 	this.setResolution(position.resolutionData);
		// }
		else {
			this.fitToExtent(extent, view);
		}
		this.setRotation(rotation, view);
	}

	setResolution(resolutionData: ICaseResolutionData, view: View = this.mapObject.getView()): void {
		if (!resolutionData) {
			return;
		}

		const projection = view.getProjection();
		const projectedPoints = this.projectPoints('EPSG:4326', projection.getCode(), [resolutionData.center, resolutionData.refPoint1, resolutionData.refPoint2]);
		const center = projectedPoints[0];
		const refPoint1 = projectedPoints[1];
		const refPoint2 = projectedPoints[2];

		const newDistance1 = this.distance(center, refPoint1);
		const newDistance2 = this.distance(center, refPoint2);

		const factor1 = this.resolutionDelta / newDistance1;
		const factor2 = this.resolutionDelta / newDistance2;
		const df1 = Math.abs(1 - factor1);
		const df2 = Math.abs(1 - factor2);
		const factor = df1 <= df2 ? factor1 : factor2;
		const newResolution = resolutionData.mapResolution / factor;
		view.setResolution(newResolution);
	}

	distance(point1, point2) {
		const result = Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
		return result;
	}

	public getPosition(): CaseMapPosition {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const transformExtent = view.calculateExtent();
		const extent = proj.transformExtent(transformExtent, projection, 'EPSG:4326');
		const projectedState = { ...view.getState(), projection: { code: projection.getCode() } };
		const resolutionData = this.getResolutionData();
		return { extent, projectedState, resolutionData };
	}

	public getResolutionData(): ICaseResolutionData {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const mapCenter = view.getCenter();
		const mapResolution = view.getResolution();
		const center: [number, number] = [mapCenter[0] || 0, mapCenter[1] || 0];
		const refPoint1: [number, number] = [center[0] + this.resolutionDelta, center[1]];
		const refPoint2: [number, number] = [center[0] - this.resolutionDelta, center[1]];
		const projectedPoints = this.projectPoints(projection.getCode(), 'EPSG:4326', [center, refPoint1, refPoint2]);
		const resultData: ICaseResolutionData = {
			center: projectedPoints[0],
			refPoint1: projectedPoints[1],
			refPoint2: projectedPoints[2],
			mapResolution: mapResolution
		};
		return resultData;
	}

	projectPoints(formProjection: string, toProjection: string, points: [[number, number]]): Array<[number, number]> {
		const result = new Array<[number, number]>();
		points.forEach((point: [number, number]) => {
			const projectedPoint = proj.transform(point, formProjection, toProjection);
			result.push(projectedPoint);
		});
		return result;
	}

	public setRotation(rotation: number, view: View = this.mapObject.getView()) {
		view.setRotation(rotation);
	}

	flyTo(location) {
		const view = this._mapObject.getView();
		view.animate({
			center: location,
			duration: 2000
		});
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
		if (!imageLayer || !this._imageProcessing) {
			return;
		}
		if (shouldPerform) {
			// the determine the order which by the image processing will occur
			const processingParams = {
				Histogram: { auto: true },
				Sharpness: { auto: true }
			};
			this._imageProcessing.processImage(processingParams);
		} else {
			this._imageProcessing.processImage(null);
		}
	}

	public setManualImageProcessing(processingParams: Object) {
		let imageLayer: ImageLayer = this._mapLayers.find((layer) => layer instanceof ImageLayer);
		if (!imageLayer || !this._imageProcessing) {
			return;
		}
		this._imageProcessing.processImage(processingParams);
	}

	// *****-- click events --********
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


	// *****-- pointer move --********

	public onPointerMove(e) {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const lonLat = proj.toLonLat(e.coordinate, projection);
		this.pointerMove.emit(lonLat);
	};

	public setPointerMove(enable: boolean) {
		// clear previous move listeners
		this.mapObject['un']('pointermove', this.onPointerMove, this);
		this.pointerMove = new EventEmitter<any>();

		if (enable) {
			this.mapObject.on('pointermove', this.onPointerMove, this);
		}
	}

	public getPointerMove() {
		return this.pointerMove;
	}

	// IMap End
	public dispose() {

	}
}
