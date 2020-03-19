import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import {
	areCoordinatesNumeric,
	BaseImageryMap,
	ExtentCalculator,
	IMAGERY_BASE_MAP_LAYER,
	IMAGERY_MAIN_LAYER_NAME,
	ImageryLayerProperties,
	ImageryMap,
	ImageryMapExtent,
	ImageryMapExtentPolygon,
	ImageryMapPosition,
	IMapProgress
} from '@ansyn/imagery';
import * as turf from '@turf/turf';
import { feature } from '@turf/turf';
import { Feature, FeatureCollection, GeoJsonObject, GeometryObject, Point as GeoPoint, Polygon } from 'geojson';
import AttributionControl from 'ol/control/Attribution';
import ScaleLine from 'ol/control/ScaleLine';
import olFeature from 'ol/Feature';
import olGeoJSON from 'ol/format/GeoJSON';
import OLGeoJSON from 'ol/format/GeoJSON';
import olPolygon from 'ol/geom/Polygon';
import * as olInteraction from 'ol/interaction'
import Group from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import OLMap from 'ol/Map';
import Vector from 'ol/source/Vector';
import View from 'ol/View';
import { Observable, of, Subject, timer } from 'rxjs';
import { debounceTime, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { IOlConfig, OL_CONFIG } from '../../../config/ol-config';
import { OpenLayersProjectionService } from '../../../projection/open-layers-projection.service';
import { OpenLayersMonitor } from '../helpers/openlayers-monitor';
import * as olShare from '../shared/openlayers-shared';
import { Utils } from '../utils/utils';

export const OpenlayersMapName = 'openLayersMap';

export enum StaticGroupsKeys {
	layers = 'layers'
}

// @dynamic
@ImageryMap({
	mapType: OpenlayersMapName,
	deps: [HttpClient, OpenLayersProjectionService, OL_CONFIG]
})
export class OpenLayersMap extends BaseImageryMap<OLMap> {
	static groupsKeys = StaticGroupsKeys;
	static groupLayers = new Map<StaticGroupsKeys, Group>(Object.values(StaticGroupsKeys).map((key) => [key, new Group()]) as any);
	private _mapObject: OLMap;
	private _backgroundMapObject: OLMap;
	public isValidPosition;
	targetElement: HTMLElement = null;
	public shadowNorthElement = null;
	getMoveEndPositionObservable = new Subject<ImageryMapPosition>();
	getMoveStartPositionObservable = new Subject<ImageryMapPosition>();
	subscribers = [];
	private showGroups = new Map<StaticGroupsKeys, boolean>();
	private _backgroundMapParams: object;
	private olGeoJSON: OLGeoJSON = new OLGeoJSON();
	private _mapLayers = [];
	private isLoading$: Subject<boolean> = new Subject();
	private monitor: OpenLayersMonitor = new OpenLayersMonitor(
		this.tilesLoadProgressEventEmitter,
		this.tilesLoadErrorEventEmitter,
		this.http
	);

	constructor(protected http: HttpClient,
				public projectionService: OpenLayersProjectionService,
				@Inject(OL_CONFIG) public olConfig: IOlConfig) {
		super();
		// todo: a more orderly way to give default values to config params
		this.olConfig.tilesLoadingDoubleBuffer = this.olConfig.tilesLoadingDoubleBuffer || {
			debounceTimeInMs: 500,
			timeoutInMs: 3000
		};
	}

	public get mapObject() {
		return this._mapObject;
	}

	public get backgroundMapObject() {
		return this._backgroundMapObject;
	}

	signalWhenTilesLoadingEnds() {
		this.isLoading$.next(true);
		this.tilesLoadProgressEventEmitter.pipe(
			filter((payload: IMapProgress) => {
				return payload.progress === 100;
			}),
			debounceTime(this.olConfig.tilesLoadingDoubleBuffer.debounceTimeInMs), // Adding debounce, to compensate for strange multiple loads when reading tiles from the browser cache (e.g. after browser refresh)
			takeUntil(timer(this.olConfig.tilesLoadingDoubleBuffer.timeoutInMs).pipe(tap(() => {
				this.isLoading$.next(false);
			}))),
			tap(() => {
				this.isLoading$.next(false);
			}),
			take(1)
		).subscribe();
	}

	/**
	 * add layer to the map if it is not already exists the layer must have an id set
	 * @param layer
	 */
	public addLayerIfNotExist(layer): Layer {
		const layerId = layer.get(ImageryLayerProperties.ID);
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

	toggleGroup(groupName: StaticGroupsKeys, newState: boolean) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (newState) {
			this.addLayer(group);
		} else {
			this.removeLayer(group);
		}
		this.showGroups.set(groupName, newState);
	}

	getLayers(): any[] {
		return this.mapObject.getLayers().getArray();
	}

	initMap(target: HTMLElement, shadowNorthElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layer: any, position?: ImageryMapPosition): Observable<boolean> {
		this.targetElement = target;
		this.shadowNorthElement = shadowNorthElement;
		this._mapLayers = [];
		const controls = [
			new ScaleLine(),
			new AttributionControl({
				collapsible: true
			})
		];
		const renderer = 'canvas';
		this._mapObject = new OLMap({
			target,
			renderer,
			controls,
			interaction: olInteraction.defaults({ doubleClickZoom: false }),
			loadTilesWhileInteracting: true,
			loadTilesWhileAnimating: true
		});
		this.initListeners();
		this._backgroundMapParams = {
			target: shadowDoubleBufferElement,
			renderer
		};
		// For initMap() we invoke resetView without double buffer
		// (otherwise resetView() would have waited for the tile loading to end, but we don't want initMap() to wait).
		// The double buffer is not relevant at this stage anyway.
		return this.resetView(layer, position);
	}

	initListeners() {
		this._mapObject.on('moveend', this._moveEndListener);
		this._mapObject.on('movestart', this._moveStartListener);
		this._mapObject.on('pointerdown', this._pointerDownListener);
		this._mapObject.on('pointermove', this._pointerMoveListener);

		this.subscribers.push(
			this.getMoveEndPositionObservable.pipe(
				switchMap((a) => {
					return this.getPosition();
				})
			).subscribe(position => {
				if (position) {
					this.positionChanged.emit(position);
				}
			}),
			this.getMoveStartPositionObservable.pipe(
				switchMap((a) => {
					return this.getPosition();
				})
			).subscribe(position => {
				if (position) {
					this.moveStart.emit(position)
				}
			})
		);
	}

	createView(layer): View {
		return new View({
			projection: layer.getSource().getProjection(),
			maxZoom: 21,
			minZoom: 1
		});
	}

	public resetView(layer: any, position: ImageryMapPosition, extent?: ImageryMapExtent, useDoubleBuffer?: boolean): Observable<boolean> {
		useDoubleBuffer = useDoubleBuffer && !layer.get(ImageryLayerProperties.FROM_CACHE);
		if (useDoubleBuffer) {
			this._backgroundMapObject = new OLMap(this._backgroundMapParams);
		} else if (this._backgroundMapObject) {
			this._backgroundMapObject.setTarget(null);
			this._backgroundMapObject = null;
		}
		const rotation: number = this._mapObject.getView() && this.mapObject.getView().getRotation();
		const view = this.createView(layer);
		// set default values to prevent map Assertion error's
		view.setCenter([0, 0]);
		view.setRotation(rotation ? rotation : 0);
		view.setResolution(1);
		if (useDoubleBuffer) {
			this.setMainLayerToBackgroundMap(layer);
			this._backgroundMapObject.setView(view);
			this.monitor.start(this.backgroundMapObject);
			this.signalWhenTilesLoadingEnds();
			return this._setMapPositionOrExtent(this.backgroundMapObject, position, extent, rotation).pipe(
				switchMap(() => this.isLoading$.pipe(
					filter((isLoading) => !isLoading),
					take(1))),
				switchMap(() => {
					this.setMainLayerToForegroundMap(layer);
					this._mapObject.setView(view);
					return this._setMapPositionOrExtent(this.mapObject, position, extent, rotation);
				})
			);
		} else {
			this.setMainLayerToForegroundMap(layer);
			this._mapObject.setView(view);
			this.monitor.start(this.mapObject);
			return this._setMapPositionOrExtent(this.mapObject, position, extent, rotation);
		}
	}

	public getLayerById(id: string): Layer {
		return <Layer>this.mapObject.getLayers().getArray().find(item => item.get(ImageryLayerProperties.ID) === id);
	}

	setGroupLayers() {
		this.showGroups.forEach((show, group) => {
			if (show) {
				this.addLayer(OpenLayersMap.groupLayers.get(group));
			}
		});
	}

	setMainLayerToForegroundMap(layer: Layer) {
		layer.set(ImageryLayerProperties.NAME, IMAGERY_MAIN_LAYER_NAME);
		layer.set(ImageryLayerProperties.MAIN_EXTENT, null);
		this.removeAllLayers();
		this.addLayer(layer);
		this.setGroupLayers();
	}

	setMainLayerToBackgroundMap(layer: Layer) {
		layer.set(ImageryLayerProperties.NAME, IMAGERY_MAIN_LAYER_NAME);
		this.backgroundMapObject.getLayers().clear();
		this.backgroundMapObject.addLayer(layer);
	}

	getMainLayer(): Layer {
		const mainLayer = this._mapLayers.find((layer: Layer) => layer.get(ImageryLayerProperties.NAME) === IMAGERY_MAIN_LAYER_NAME);
		return mainLayer;
	}

	fitToExtent(extent: ImageryMapExtent, map: OLMap = this.mapObject, view: View = map.getView()) {
		const collection: any = turf.featureCollection([ExtentCalculator.extentToPolygon(extent)]);

		return this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, map).pipe(
			tap((features: olFeature[]) => {
				view.fit(features[0].getGeometry() as olPolygon, { nearest: true, constrainResolution: false });
			})
		);
	}

	public addMapLayer(layer: any) {
		const main = this.getMainLayer();
		const baseMapLayer = this._mapLayers.find((layer: Layer) => layer.get(ImageryLayerProperties.NAME) === IMAGERY_BASE_MAP_LAYER);
		if (baseMapLayer) {
			this.removeLayer(baseMapLayer);
		}
		if (layer.get(ImageryLayerProperties.ID) !== main.get(ImageryLayerProperties.ID)) {
			this.addLayer(layer);
		}
	}

	public addLayer(layer: any) {

		if (!this._mapLayers.includes(layer)) {
			this._mapLayers.push(layer);
			this._mapObject.addLayer(layer);
		}
	}

	public removeAllLayers() {
		this.showGroups.forEach((show, group) => {
			if (show && this._mapObject) {
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
		olShare.removeWorkers(layer);
		this._mapLayers = this._mapLayers.filter((mapLayer) => mapLayer !== layer);
		this._mapObject.removeLayer(layer);
		this._mapObject.renderSync();
	}

	public setCenter(center: GeoPoint, animation: boolean): Observable<boolean> {
		return this.projectionService.projectAccuratelyToImage(center, this.mapObject).pipe(map(projectedCenter => {
			const olCenter = <[number, number]>projectedCenter.coordinates;
			if (animation) {
				this.flyTo(olCenter);
			} else {
				const view = this._mapObject.getView();
				view.setCenter(olCenter);
			}

			return true;
		}));
	}

	public updateSize(): void {
		const center = this._mapObject.getView().getCenter();
		if (!areCoordinatesNumeric(center)) {
			return;
		}
		this._mapObject.updateSize();
		this._mapObject.renderSync();
	}

	public getCenter(): Observable<GeoPoint> {
		if (!this.isValidPosition) {
			return of(null);
		}
		const view = this._mapObject.getView();
		const center = view.getCenter();
		if (!areCoordinatesNumeric(center)) {
			return of(null);
		}
		const point = <GeoPoint>turf.geometry('Point', center);

		return this.projectionService.projectAccurately(point, this.mapObject);
	}

	calculateRotateExtent(olmap: OLMap): Observable<{ extentPolygon: ImageryMapExtentPolygon, layerExtentPolygon: ImageryMapExtentPolygon }> {
		const mainLayer = this.getMainLayer();
		if (!this.isValidPosition || !mainLayer) {
			return of({ extentPolygon: null, layerExtentPolygon: null });
		}

		const [width, height] = olmap.getSize();
		const topLeft = olmap.getCoordinateFromPixel([0, 0]);
		const topRight = olmap.getCoordinateFromPixel([width, 0]);
		const bottomRight = olmap.getCoordinateFromPixel([width, height]);
		const bottomLeft = olmap.getCoordinateFromPixel([0, height]);
		const coordinates = [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
		const someIsNaN = !coordinates[0].every(areCoordinatesNumeric);
		if (someIsNaN) {
			return of({ extentPolygon: null, layerExtentPolygon: null });
		}

		const cachedMainExtent = mainLayer.get(ImageryLayerProperties.MAIN_EXTENT);
		const mainExtent = mainLayer.getExtent();
		if (mainExtent && !Boolean(cachedMainExtent)) {
			const layerExtentPolygon = Utils.extentToOlPolygon(mainExtent);
			return this.projectionService.projectCollectionAccurately([new olFeature(new olPolygon(coordinates)), new olFeature(layerExtentPolygon)], olmap).pipe(
				map((collection: FeatureCollection<GeometryObject>) => {
					mainLayer.set(ImageryLayerProperties.MAIN_EXTENT, collection.features[1].geometry as Polygon);
					return {
						extentPolygon: collection.features[0].geometry as Polygon,
						layerExtentPolygon: collection.features[1].geometry as Polygon
					};
				})
			);
		}
		return this.projectionService.projectCollectionAccurately([new olFeature(new olPolygon(coordinates))], olmap)
			.pipe(map((collection: FeatureCollection<GeometryObject>) => {
				return {
					extentPolygon: collection.features[0].geometry as Polygon,
					layerExtentPolygon: cachedMainExtent
				};
			}));
	}

	fitRotateExtent(olmap: OLMap, extentFeature: Feature<ImageryMapExtentPolygon>, customResolution?: number): Observable<boolean> {
		const collection: any = turf.featureCollection([extentFeature]);

		return this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, olmap).pipe(
			map((features: olFeature[]) => {
				const view: View = olmap.getView();
				const geoJsonFeature = <any>this.olGeoJSON.writeFeaturesObject(features,
					{ featureProjection: view.getProjection(), dataProjection: view.getProjection() });
				const geoJsonExtent = geoJsonFeature.features[0].geometry;

				const center = ExtentCalculator.calcCenter(geoJsonExtent);
				const rotation = ExtentCalculator.calcRotation(geoJsonExtent);
				const resolution = ExtentCalculator.calcResolution(geoJsonExtent, olmap.getSize(), rotation);

				view.setCenter(center);
				view.setRotation(rotation);
				view.setResolution(customResolution ? customResolution : Math.abs(resolution));
				this.isValidPosition = true;
				return true;
			})
		);
	}

	public setPosition(position: ImageryMapPosition, map: OLMap = this.mapObject, view: View = map.getView()): Observable<boolean> {
		const { extentPolygon, projectedState, customResolution } = position;

		const someIsNan = !extentPolygon.coordinates[0].every(areCoordinatesNumeric);
		if (someIsNan) {
			console.warn('ol map setposition failed, can\'t handle invalid coordinates ' + extentPolygon);
			return of(true);
		}

		const viewProjection = view.getProjection();
		const isProjectedPosition = projectedState && viewProjection.getCode() === projectedState.projection.code;
		if (isProjectedPosition) {
			const { center, zoom, rotation } = projectedState;
			view.setCenter(center);
			view.setZoom(zoom);
			view.setRotation(rotation);
			this.isValidPosition = true;
			return of(true);
		} else {
			const extentFeature = feature(extentPolygon);
			return this.fitRotateExtent(map, extentFeature, customResolution);
		}
	}

	public getPosition(): Observable<ImageryMapPosition> {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const projectedState = {
			...(<any>view).getState(),
			center: (<any>view).getCenter(),
			projection: { code: projection.getCode() }
		};

		return this.calculateRotateExtent(this.mapObject).pipe(map(({ extentPolygon: extentPolygon, layerExtentPolygon: layerExtentPolygon }) => {
			if (!extentPolygon) {
				return null;
			}

			const someIsNaN = !extentPolygon.coordinates[0].every(areCoordinatesNumeric);
			if (someIsNaN) {
				console.warn('ol map getPosition failed invalid coordinates ', extentPolygon);
				return null;
			}

			if (this.olConfig.needToUseLayerExtent && this.needToUseLayerExtent(layerExtentPolygon, extentPolygon)) {
				extentPolygon = layerExtentPolygon;
			}

			return { extentPolygon, projectedState };
		}));
	}

	needToUseLayerExtent(layerExtentPolygon: ImageryMapExtentPolygon, extentPolygon: ImageryMapExtentPolygon) {
		if (!layerExtentPolygon) {
			return false;
		}

		// check if 3 out of 4 coordinates inside main layer extent
		let cornersInside = 0;
		for (let i = 0; i < extentPolygon.coordinates[0].length - 1; i++) { // -1 in order to ignore duplicated coordinate
			const isInside = turf.booleanPointInPolygon(turf.point(extentPolygon.coordinates[0][i]), turf.polygon(layerExtentPolygon.coordinates), { ignoreBoundary: false });
			if (isInside) {
				cornersInside++;
			}
		}
		return cornersInside < 3;
	}

	public setRotation(rotation: number, map: OLMap = this.mapObject, view: View = map.getView()) {
		view.setRotation(rotation);
	}

	public getRotation(view: View = this.mapObject.getView()): number {
		return view.getRotation();
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

	flyTo(location: [number, number]) {
		const view = this._mapObject.getView();
		view.animate({
			center: location,
			duration: 2000
		});
	}

	public addGeojsonLayer(data: GeoJsonObject): void {
		let layer: VectorLayer = new VectorLayer({
			source: new Vector({
				features: new olGeoJSON().readFeatures(data)
			})
		});
		this.mapObject.addLayer(layer);
	}

	getExtraData() {
		return this.getMainLayer().getProperties()
	}

	getCoordinateFromScreenPixel(screenPixel: { x, y }): [number, number, number] {
		const coordinate = this.mapObject.getCoordinateFromPixel([screenPixel.x, screenPixel.y]);
		return coordinate;
	}

	getHtmlContainer(): HTMLElement {
		return this.targetElement;
	}

	// BaseImageryMap End
	public dispose() {
		this.removeAllLayers();

		if (this._mapObject) {
			if (this.subscribers) {
				this.subscribers.forEach((subscriber) => subscriber.unsubscribe());
				delete this.subscribers;
			}

			this._mapObject.un('moveend', this._moveEndListener);
			this._mapObject.un('movestart', this._moveStartListener);
			this._mapObject.un('pointerdown', this._pointerDownListener);
			this._mapObject.un('pointermove', this._pointerMoveListener);
			this._mapObject.setTarget(null);
		}

		if (this._backgroundMapObject) {
			this._backgroundMapObject.setTarget(null);
		}

		this.monitor.dispose();
	}

	private _moveEndListener: () => void = () => {
		this.getMoveEndPositionObservable.next(null);
	};

	private _pointerMoveListener: (args) => void = (args) => {
		const point = <GeoPoint>turf.geometry('Point', args.coordinate);
		return this.projectionService.projectApproximately(point, this.mapObject).pipe(
			take(1),
			tap((projectedPoint) => {
				if (areCoordinatesNumeric(projectedPoint.coordinates)) {
					this.mousePointerMoved.emit({
						long: projectedPoint.coordinates[0],
						lat: projectedPoint.coordinates[1],
						height: NaN
					});
				} else {
					this.mousePointerMoved.emit({ long: NaN, lat: NaN, height: NaN });
				}
			}))
			.subscribe();
	};

	private _moveStartListener: () => void = () => {
		this.getMoveStartPositionObservable.next(null);
	};

	private _pointerDownListener: (args) => void = () => {
		(<any>document.activeElement).blur();
	};

	// Used by resetView()
	private _setMapPositionOrExtent(map: OLMap, position: ImageryMapPosition, extent: ImageryMapExtent, rotation: number): Observable<boolean> {
		if (extent) {
			this.fitToExtent(extent, map).subscribe();
			if (rotation) {
				this.setRotation(rotation, map);
			}
			this.isValidPosition = true;
		} else if (position) {
			return this.setPosition(position, map);
		}

		return of(true);
	}
}
