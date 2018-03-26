import { IMap } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { CaseMapExtent, CaseMapExtentPolygon, CaseMapPosition } from '@ansyn/core';
import { OpenLayersImageProcessing } from '../image-processing/open-layers-image-processing';
import OLMap from 'ol/map';
import View from 'ol/view';
import ScaleLine from 'ol/control/scaleline';
import Group from 'ol/layer/group';
import olGeoJSON from 'ol/format/geojson';
import OLGeoJSON from 'ol/format/geojson';
import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import Raster from 'ol/source/raster';
import OSM from 'ol/source/osm';
import Layer from 'ol/layer/layer';
import TileLayer from 'ol/layer/tile';
import ImageLayer from 'ol/layer/image';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';
import olPolygon from 'ol/geom/polygon';
import * as turf from '@turf/turf';

import { ExtentCalculator } from '@ansyn/core/utils/extent-calculator';
import { Subscription } from 'rxjs/Subscription';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Polygon } from 'geojson';
import { OpenLayersMousePositionControl } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-mouseposition-control';
import 'rxjs/add/operator/take';

export const OpenlayersMapName = 'openLayersMap';

export class OpenLayersMap extends IMap<OLMap> {
	static mapType = OpenlayersMapName;

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
	private approximateProjectionSubscription: Subscription = null;
	private _subscriptions: Subscription[] = [];
	private _contextMenuEventListener: (e: MouseEvent) => void;
	private _moveEndListener: () => void;
	private _containerElem: HTMLElement;
	private olGeoJSON: OLGeoJSON = new OLGeoJSON();

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
		this.initMap(element, _mapLayers, position).subscribe();
	}

	public positionToPoint(coordinates: ol.Coordinate, cb: (p: GeoJSON.Point) => void) {
		if (this.projectionSubscription) {
			this.projectionSubscription.unsubscribe();
		}
		const point = <GeoJSON.Point> turf.geometry('Point', coordinates);
		this.projectionSubscription = this.projectionService
			.projectAccurately(point, this).subscribe(cb);
	}

	private approximatePositionToPoint(coordinates: ol.Coordinate, cb: (p: GeoJSON.Point) => void) {
		if (this.approximateProjectionSubscription) {
			this.approximateProjectionSubscription.unsubscribe();
		}

		const point = <GeoJSON.Point> turf.geometry('Point', coordinates);
		this.approximateProjectionSubscription = this.projectionService.projectApproximately(point, this)
			.subscribe(cb);
	}

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition): Observable<boolean> {
		const [mainLayer] = layers;
		const view = this.createView(mainLayer);
		const coordinateFormat: ol.CoordinateFormatType = (coords: ol.Coordinate): string => coords.map((num) => +num.toFixed(4)).toString();
		this._mapObject = new OLMap({
			target: element,
			layers,
			renderer: 'canvas',
			controls: [new ScaleLine(), new OpenLayersMousePositionControl({ projection: 'EPSG:4326', coordinateFormat  },
				(point) => this.projectionService.projectApproximately(point, this))],
			view
		});

		let setPositionObservable: Observable<boolean> = Observable.of(true);
		if (position) {
			setPositionObservable = this.setPosition(position);
		}

		return setPositionObservable.do(() => {
			this.initListeners();
			this.setGroupLayers();
		});
	}

	initListeners() {
		this._moveEndListener = () => {
			this._subscriptions.push(
				this.getCenter().take(1).subscribe(mapCenter => {
					this.centerChanged.emit(mapCenter);
				}),

				this.getPosition().take(1).subscribe(position => {
					if (position) {
						this.positionChanged.emit(position);
					}
				})
			);
		};

		this._mapObject.on('moveend', this._moveEndListener);

		this._containerElem = <HTMLElement> this._mapObject.getViewport();

		this._contextMenuEventListener = (e: MouseEvent) => {
			e.preventDefault();

			this._containerElem.click();

			let coordinate = this._mapObject.getCoordinateFromPixel([e.offsetX, e.offsetY]);
			this.positionToPoint(coordinate, point => this.contextMenu.emit({ point, e }));
		};

		this._containerElem.addEventListener('contextmenu', this._contextMenuEventListener);
	}

	createView(layer): View {
		return new View({
			projection: layer.getSource().getProjection(),
			minZoom: 2.5
		});
	}

	public resetView(layer: any, position: CaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		if (this.projectionSubscription) {
			this.projectionSubscription.unsubscribe();
		}

		if (this.approximateProjectionSubscription) {
			this.approximateProjectionSubscription.unsubscribe();
		}

		const rotation = this.mapObject.getView().getRotation();
		const view = this.createView(layer);
		this.setMainLayer(layer);
		this._mapObject.setView(view);

		if (extent) {
			this.fitToExtent(extent);
			this.mapObject.getView().setRotation(rotation);
		} else {
			return this.setPosition(position);
		}

		return Observable.of(true);
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
		const collection = turf.featureCollection([ExtentCalculator.extentToPolygon(extent)]);

		this.projectionService.projectCollectionAccuratelyToImage<Feature>(collection, this)
			.subscribe((features: Feature[]) => {
				view.fit(features[0].getGeometry() as olPolygon, { nearest: true });
			});
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

	public setCenter(center: GeoJSON.Point, animation: boolean): Observable<boolean> {
		return this.projectionService.projectAccuratelyToImage(center, this).map(projectedCenter => {
			const olCenter = <ol.Coordinate> projectedCenter.coordinates;
			if (animation) {
				this.flyTo(olCenter);
			} else {
				const view = this._mapObject.getView();
				view.setCenter(olCenter);
			}

			return true;
		});
	}

	public updateSize(): void {
		this._mapObject.updateSize();
		this._mapObject.renderSync();
	}

	public getCenter(): Observable<GeoJSON.Point> {
		const view = this._mapObject.getView();
		const center = view.getCenter();
		const point = <GeoJSON.Point> turf.geometry('Point', center);

		return this.projectionService.projectAccurately(point, this);
	}

	calculateRotateExtent(map: OLMap): Observable<CaseMapExtentPolygon> {
		const [width, height] = map.getSize();
		const topLeft = map.getCoordinateFromPixel([0, 0]);
		const topRight = map.getCoordinateFromPixel([width, 0]);
		const bottomRight = map.getCoordinateFromPixel([width, height]);
		const bottomLeft = map.getCoordinateFromPixel([0, height]);
		const coordinates = [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
		const someIsNaN = coordinates[0].some(([x, y]) => isNaN(x) || isNaN(y));
		if (someIsNaN) {
			return Observable.of(null);
		}

		return this.projectionService.projectCollectionAccurately([new Feature(new olPolygon(coordinates))], this)
			.map((collection: FeatureCollection<GeometryObject>) => collection.features[0].geometry as Polygon);
	}

	fitRotateExtent(map: OLMap, extentFeature: CaseMapExtentPolygon): Observable<boolean> {
		const collection: GeoJSON.FeatureCollection<Polygon> = turf.featureCollection([turf.feature(extentFeature)]);

		return this.projectionService.projectCollectionAccuratelyToImage<Feature>(collection, this)
			.map((features: Feature[]) => {
				const view: View = map.getView();
				const geoJsonFeature = <any> this.olGeoJSON.writeFeaturesObject(features,
					{ featureProjection: view.getProjection(), dataProjection: view.getProjection() });
				const geoJsonExtent = geoJsonFeature.features[0].geometry;

				const center = ExtentCalculator.calcCenter(geoJsonExtent);
				const rotation = ExtentCalculator.calcRotation(geoJsonExtent);
				const resolution = ExtentCalculator.calcResolution(geoJsonExtent, map.getSize(), rotation);

				view.setCenter(center);
				view.setRotation(rotation);
				view.setResolution(resolution);
				return true;
			});
	}

	public setPosition(position: CaseMapPosition, view: View = this.mapObject.getView()): Observable<boolean> {
		const { extentPolygon, projectedState } = position;
		const viewProjection = view.getProjection();
		const isProjectedPosition = viewProjection.getCode() === projectedState.projection.code;
		if (isProjectedPosition) {
			const { center, zoom, rotation } = projectedState;
			view.setCenter(center);
			view.setZoom(zoom);
			view.setRotation(rotation);
			return Observable.of(true);
		} else {
			return this.fitRotateExtent(this.mapObject, extentPolygon);
		}
	}

	public getPosition(): Observable<CaseMapPosition> {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const projectedState = { ...(<any>view).getState(), projection: { code: projection.getCode() } };
		return this.calculateRotateExtent(this.mapObject).map(extentPolygon => {
			if (!extentPolygon) {
				return null;
			}
			return { extentPolygon, projectedState };
		});
	}

	public setRotation(rotation: number, view: View = this.mapObject.getView()) {
		view.setRotation(rotation);
	}

	public getRotation(view: View = this.mapObject.getView()): number {
		return view.getRotation();
	}


	flyTo(location: ol.Coordinate) {
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
		this.approximatePositionToPoint(e.coordinate, p => this.pointerMove.emit(p.coordinates));
	}

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

		if (this.approximateProjectionSubscription) {
			this.approximateProjectionSubscription.unsubscribe();
		}

		if (this._mapObject) {
			this._mapObject.un('moveend', this._moveEndListener);
		}

		this._subscriptions.forEach(observable$ => observable$.unsubscribe());

		if (this._containerElem) {
			this._containerElem.removeEventListener('contextmenu', this._contextMenuEventListener);
		}
	}
}
