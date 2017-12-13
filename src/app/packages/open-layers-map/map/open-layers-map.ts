import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { CaseMapPosition } from '@ansyn/core';
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
	private _mapLayers = [];
	public centerChanged: EventEmitter<GeoJSON.Point> = new EventEmitter<GeoJSON.Point>();
	public positionChanged: EventEmitter<CaseMapPosition> = new EventEmitter<CaseMapPosition>();
	public pointerMove: EventEmitter<any> = new EventEmitter<any>();
	public singleClick: EventEmitter<any> = new EventEmitter<any>();
	public contextMenu: EventEmitter<any> = new EventEmitter<any>();

	private _pinPointIndicatorLayerId = 'pinPointIndicator';
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

		const layersArray = group.getLayers().getArray();
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

	constructor(element: HTMLElement, layers: any, position?: CaseMapPosition) {
		super();

		if (!OpenLayersMap.groupLayers.get('layers')) {
			OpenLayersMap.groupLayers.set('layers', new Group({
				layers: [],
				name: 'layers'
			}));
		}

		this.showGroups.set('layers', true);

		this.initMap(element, layers, position);
	}

	public positionToPoint(x, y): GeoJSON.Point {
		let coordinates = this._mapObject.getCoordinateFromPixel([x, y]);
		const projection = this._mapObject.getView().getProjection();
		coordinates = proj.toLonLat(coordinates, projection);
		return { type: 'Point', coordinates };
	}

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition) {
		let center = [0, 0];
		let zoom = 1;
		let rotation = 0;

		if (position) {
			rotation = position.rotation;
		}

		this._mapObject = new OLMap({
			target: element,
			layers: layers,
			renderer: 'canvas',
			controls: [new ScaleLine()],
			view: new View({
				center: proj.fromLonLat(center),
				zoom: zoom,
				rotation: rotation,
				minZoom: 2.5
			})
		});

		this._mapLayers = layers;

		if (position && position.extent) {
			this.fitToExtent(position.extent);
		}

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

		this.setGroupLayers();
	}


	// IMap Start

	public resetView(layer: any, extent?: CaseMapExtent, resolution?: number) {
		this.setMainLayer(layer);

		if (extent) {
			this.fitToExtent(extent, resolution);
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
		const oldview = this._mapObject.getView();
		const rotation = oldview.getRotation();
		const oldProjection = oldview.getProjection();
		const projection = layer.getSource().getProjection();
		const viewExtent = oldview.calculateExtent(this.mapObject.getSize());
		const extent = proj.transformExtent(viewExtent, oldProjection, projection);
		const resolution = oldview.getResolution();

		const view: any = new View({
			rotation,
			projection,
			minZoom: 2.5
		});

		view.fit(extent, this.mapObject.getSize());
		view.setResolution(resolution);

		this._mapObject.setView(view);
		this.addLayer(layer);

		if (layer.getSource() instanceof Raster) {
			this._imageProcessing = new OpenLayersImageProcessing(layer.getSource());
		} else {
			this._imageProcessing = null;
		}

		this.setGroupLayers();
	}

	fitToExtent(extent: CaseMapExtent, resolution?: number) {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const transformExtent = proj.transformExtent(extent, 'EPSG:4326', projection);
		view.fit(transformExtent, { size: this.mapObject.getSize(), constrainResolution: false });
		if (resolution) {
			view.setResolution(resolution);
		}
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

	public setPosition(position: CaseMapPosition): void {
		this.fitToExtent(position.extent, position.resolution);
		this.setRotation(position.rotation);
	}

	public getPosition(): CaseMapPosition {
		const view = this._mapObject.getView();
		const projection = view.getProjection();
		const rotation: number = view.getRotation();
		const transformExtent = view.calculateExtent(this.mapObject.getSize());
		const extent = proj.transformExtent(transformExtent, projection, 'EPSG:4326');
		const resolution = view.getResolution();
		return { extent, rotation, resolution };
	}

	public setRotation(rotation: number) {
		const view = this._mapObject.getView();
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

	/* ******** unused functions ? ******** */
	addInteraction(interaction) {
		this._mapObject.addInteraction(interaction);
	}

	removeInteraction(interaction) {
		this._mapObject.removeInteraction(interaction);
	}

	internalBeforeSetMainLayer(): { pinPointLonLatGeo } {
		const pinPointIndicatorLayer: Layer = <Layer>this.getLayerById(this._pinPointIndicatorLayerId);
		let lonLatCords;
		if (pinPointIndicatorLayer) {
			let pinPointGeometry = (<any>pinPointIndicatorLayer).getSource().getFeatures()[0].getGeometry();
			const oldView = this._mapObject.getView();
			const oldViewProjection = oldView.getProjection();
			const layerCords = pinPointGeometry.getCoordinates();
			lonLatCords = proj.transform(layerCords, oldViewProjection, 'EPSG:4326');
		}
		return { pinPointLonLatGeo: lonLatCords };
	}

	public removeLayerById(layerId) {
		const layer = this.getLayerById(layerId);
		if (layer) {
			// layer.set('visible',false);
			this.removeLayer(layer);
		}
	}
}
