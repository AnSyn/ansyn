import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { CaseMapExtent, CaseMapExtentPolygon, CaseMapPosition } from '@ansyn/core';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';
import OLMap from 'ol/map';
import View from 'ol/view';
import proj from 'ol/proj';
import ScaleLine from 'ol/control/scaleline';
import Group from 'ol/layer/group';
import olGeoJSON from 'ol/format/geojson';
import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import Raster from 'ol/source/raster';
import OSM from 'ol/source/osm';
import Layer from 'ol/layer/layer';
import TileLayer from 'ol/layer/tile';
import ImageLayer from 'ol/layer/image';
import VectorLayer from 'ol/layer/vector';
import MousePosition from 'ol/control/mouseposition'
import Coordinate from 'ol/coordinate';

import * as GeoJSON from 'geojson';

import { ExtentCalculator } from '@ansyn/core/utils/extent-calculator';
import { Subscription } from 'rxjs/Subscription';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

export class OpenLayersMap extends IMap<OLMap> {
	static mapType = 'openLayersMap';

	static groupLayers = new Map<string, Group>();

	private showGroups = new Map<string, boolean>();
	public mapType: string = OpenLayersMap.mapType;
	private _mapObject: OLMap;
	public centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	public positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	public pointerMove: EventEmitter<any> = new EventEmitter<any>();
	public singleClick: EventEmitter<any> = new EventEmitter<any>();
	public contextMenu: EventEmitter<any> = new EventEmitter<any>();

	private projectionSubscription: Subscription = null;

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
		(<any>vectorLayer).id = layer.id;

		OpenLayersMap.addGroupLayer(vectorLayer, groupName);
	}

	constructor(element: HTMLElement, public projectionService: ProjectionService, private _mapLayers = [], position?: CaseMapPosition) {
		super();

		if (!OpenLayersMap.groupLayers.get('layers')) {
			OpenLayersMap.groupLayers.set('layers', new Group(<any>{
				layers: [],
				name: 'layers'
			}));
		}

		this.showGroups.set('layers', true);
		this.initMap(element, _mapLayers, position);
	}

	public positionToPoint(coordinate: ol.Coordinate, cb: (p: GeoJSON.Point) => void) {
		if (this.projectionSubscription) {
			this.projectionSubscription.unsubscribe();
		}

		this.projectionSubscription = this.projectionService
			.projectAccurately(coordinate, this).subscribe(cb);
	}

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition) {
		const [mainLayer] = layers;
		const view = this.createView(mainLayer);
		const coordinateFormat: ol.CoordinateFormatType = (coords: ol.Coordinate): string => coords.map((num) => +num.toFixed(4)).toString();
		this._mapObject = new OLMap({
			target: element,
			layers,
			renderer: 'canvas',
			controls: [new ScaleLine(), new MousePosition({ projection: 'EPSG:4326', coordinateFormat  })],
			view
		});
		if (position) {
			this.setPosition(position);
		}
		this.initListeners();
		this.setGroupLayers();
	}

	initListeners() {
		this._mapObject.on('moveend', () => {
			const mapCenter = this.getCenter();
			this.centerChanged.emit(mapCenter);
			const position = this.getPosition();
			if (position) {
				this.positionChanged.emit(position);
			}
		});

		const containerElem = <HTMLElement> this._mapObject.getViewport();

		containerElem.addEventListener('contextmenu', (e: MouseEvent) => {
			e.preventDefault();

			containerElem.click();

			let coordinate = this._mapObject.getCoordinateFromPixel([e.offsetX, e.offsetY]);
			this.positionToPoint(coordinate, point => this.contextMenu.emit({ point, e }));
		});
	}

	createView(layer): View {
		return new View({
			projection: layer.getSource().getProjection(),
			minZoom: 2.5
		});
	}

	public resetView(layer: any, position: CaseMapPosition, extent?: CaseMapExtent) {
		if (this.projectionSubscription) {
			this.projectionSubscription.unsubscribe();
		}

		const rotation = this.mapObject.getView().getRotation();
		const view = this.createView(layer);
		this.setMainLayer(layer);
		this._mapObject.setView(view);

		if (extent) {
			this.fitToExtent(extent);
			this.mapObject.getView().setRotation(rotation);
		} else {
			this.setPosition(position);
		}
	}

	public getLayerById(id: string): Layer {
		return <Layer> this.mapObject.getLayers().getArray().find(item => item.get('id') === id);
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
			this._imageProcessing = new OpenLayersImageProcessing((<any>layer).getSource());
		} else {
			this._imageProcessing = null;
		}

		this.setGroupLayers();
	}

	fitToExtent(extent: CaseMapExtent, view: View = this.mapObject.getView()) {
		const projection = view.getProjection();
		const transformExtent = proj.transformExtent(extent, 'EPSG:4326', projection);
		view.fit(transformExtent, { nearest: true });
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
		const existingLayer: Layer = this.getLayerById(layerId);
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
			this._mapObject.renderSync();
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
		this._mapObject.renderSync();
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

	calculateRotateExtent(map: OLMap): CaseMapExtentPolygon {
		const view = map.getView();
		const projection = view.getProjection();
		const [width, height] = map.getSize();
		const topLeft = map.getCoordinateFromPixel([0, 0]);
		const topRight = map.getCoordinateFromPixel([width, 0]);
		const bottomRight = map.getCoordinateFromPixel([width, height]);
		const bottomLeft = map.getCoordinateFromPixel([0, height]);
		const coordinates = [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
		const type: 'Polygon' = 'Polygon';
		const extentPolygon = { type, coordinates };
		const someIsNaN = coordinates[0].some(([x, y]) => isNaN(x) || isNaN(y));
		if (someIsNaN) {
			return null;
		}
		return ExtentCalculator.transform(proj.transform.bind(proj), extentPolygon, projection, 'EPSG:4326');
	}


	fitRotateExtent(map: OLMap, extentFeature: CaseMapExtentPolygon) {
		const view: ol.View = map.getView();
		const size = map.getSize();
		const projection = view.getProjection();
		extentFeature = ExtentCalculator.transform(proj.transform.bind(proj), extentFeature, 'EPSG:4326', projection);

		const center = ExtentCalculator.calcCenter(extentFeature);
		const rotation = ExtentCalculator.calcRotation(extentFeature);
		const resolution = ExtentCalculator.calcResolution(extentFeature, size, rotation);

		view.setCenter(center);
		view.setRotation(rotation);
		view.setResolution(resolution);
	}

	public setPosition(position: CaseMapPosition, view: View = this.mapObject.getView()): void {
		const { extentPolygon, projectedState } = position;
		const viewProjection = view.getProjection();
		const isProjectedPosition = viewProjection.getCode() === projectedState.projection.code;
		if (isProjectedPosition) {
			const { center, zoom, rotation } = projectedState;
			view.setCenter(center);
			view.setZoom(zoom);
			view.setRotation(rotation);
		} else {
			this.fitRotateExtent(this.mapObject, extentPolygon);
		}
	}

	public getPosition(): CaseMapPosition {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const projectedState = { ...(<any>view).getState(), projection: { code: projection.getCode() } };
		const extentPolygon = this.calculateRotateExtent(this.mapObject);
		if (!extentPolygon) {
			return null;
		}
		return { extentPolygon, projectedState };
	}

	public setRotation(rotation: number, view: View = this.mapObject.getView()) {
		view.setRotation(rotation);
	}

	public getRotation(view: View = this.mapObject.getView()): number {
		return view.getRotation();
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
				features: new olGeoJSON().readFeatures(data)
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
		this.positionToPoint(e.coordinate, p => this.singleClick.emit({lonLat: p.coordinates}));
	}

	// *****-- pointer move --********

	public onPointerMove(e) {
		this.positionToPoint(e.coordinate, p => this.pointerMove.emit({lonLat: p.coordinates}));
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
		if (this.projectionSubscription) {
			this.projectionSubscription.unsubscribe();
		}
	}
}
