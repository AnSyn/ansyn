import OLMap from 'ol/Map';
import View from 'ol/View';
import ScaleLine from 'ol/control/ScaleLine';
import Group from 'ol/layer/Group';
import olGeoJSON from 'ol/format/GeoJSON';
import OLGeoJSON from 'ol/format/GeoJSON';
import Vector from 'ol/source/Vector';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import olFeature from 'ol/Feature';
import olPolygon from 'ol/geom/Polygon';
import AttributionControl from 'ol/control/Attribution';
import * as turf from '@turf/turf';
import { feature } from '@turf/turf';
import { BaseImageryMap, IMAGERY_MAIN_LAYER_NAME, ImageryLayerProperties, ImageryMap } from '@ansyn/imagery';
import { combineLatest, Observable, of } from 'rxjs';
import { Feature, FeatureCollection, GeoJsonObject, GeometryObject, Point as GeoPoint, Polygon } from 'geojson';
import { OpenLayersMousePositionControl } from './openlayers-mouseposition-control';
import {
	areCoordinatesNumeric,
	CaseMapExtent,
	CaseMapExtentPolygon,
	CoreConfig,
	ExtentCalculator,
	ICaseMapPosition,
	ICoreConfig
} from '@ansyn/core';
import * as olShare from '../shared/openlayers-shared';
import { Utils } from '../utils/utils';
import { Inject } from '@angular/core';
import { debounceTime, filter, map, take, tap } from 'rxjs/operators';
import { OpenLayersProjectionService } from '../../../projection/open-layers-projection.service';
import { Actions, ofType } from '@ngrx/effects';
import { MapActionTypes, selectIsLoadingTiles, SetIsLoadingTilesAction, SetProgressBarAction } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';

export const OpenlayersMapName = 'openLayersMap';

export enum StaticGroupsKeys {
	layers = 'layers'
}

interface ISavedParams {
	layer: Layer,
	view: View,
	position: ICaseMapPosition,
	extent: CaseMapExtent,
	rotation: number
}

// @dynamic
@ImageryMap({
	mapType: OpenlayersMapName,
	deps: [OpenLayersProjectionService, CoreConfig, Actions, Store],
	defaultMapSource: 'BING'
})
export class OpenLayersMap extends BaseImageryMap<OLMap> {
	static groupsKeys = StaticGroupsKeys;
	static groupLayers = new Map<StaticGroupsKeys, Group>(Object.values(StaticGroupsKeys).map((key) => [key, new Group()]) as any);
	private showGroups = new Map<StaticGroupsKeys, boolean>();
	private _mapObject: OLMap;
	private _backgroundMapObject: OLMap;
	private _backgroundMapParams: object;

	private _moveEndListener: () => void;
	private olGeoJSON: OLGeoJSON = new OLGeoJSON();
	private _mapLayers = [];
	public isValidPosition;
	public shadowElement = null;
	private savedParams: ISavedParams;
	private mapId: string;

	public isLoadingLayers$: Observable<boolean> = this.store$.select(selectIsLoadingTiles).pipe(
		map((f) => f(this.mapId))
	);

	setMainLayerToForegroundMapAfterTilesAreLoaded() {
		this.actions$.pipe(
			ofType<SetProgressBarAction>(MapActionTypes.VIEW.SET_PROGRESS_BAR),
			filter(({ payload }) => {
				return payload.progress === 100;
			}),
			debounceTime(500), // Adding debounce, to compensate for strange multiple loads when reading tiles from the browser cache (e.g. after browser refresh)
			tap(({ payload }) => {
				const { layer, view, position, extent, rotation } = this.savedParams;
				this.setMainLayerToForegroundMap(layer);
				this._mapObject.setView(view);
				this._setMapPositionOrExtent(this.mapObject, position, extent, rotation).pipe(take(1)).subscribe();
			}),
			take(1)
		).subscribe();
	}

	private _pointerDownListener: (args) => void = () => {
		(<any>document.activeElement).blur()
	};

	constructor(public projectionService: OpenLayersProjectionService, @Inject(CoreConfig) public coreConfig: ICoreConfig,
				public actions$: Actions,
				public store$: Store<any>) {
		super();
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

	initMap(target: HTMLElement, shadowElement: HTMLElement, layers: any, position?: ICaseMapPosition, mapId?: string): Observable<boolean> {
		this.shadowElement = shadowElement;
		this._mapLayers = [];
		const controls = [
			new ScaleLine(),
			new AttributionControl(),
			new OpenLayersMousePositionControl({
					projection: 'EPSG:4326',
					coordinateFormat: (coords: [number, number]): string => coords.map((num) => +num.toFixed(4)).toString()
				},
				(point) => this.projectionService.projectApproximately(point, this.mapObject))
		];
		const renderer = 'canvas';
		this._mapObject = new OLMap({
			target,
			renderer,
			controls,
			loadTilesWhileInteracting: true,
			loadTilesWhileAnimating: true
		});
		this.initListeners();
		this._backgroundMapParams = {
			target: shadowElement,
			renderer
		};
		// For initMap() we invoke resetView without double buffer
		// (otherwise resetView() would have waited for the tile loading to end, but we don't want initMap() to wait).
		// The double buffer is not relevant at this stage anyway.
		return this.resetView(layers[0], position, undefined, mapId);
	}

	initListeners() {
		this._moveEndListener = () => {
			this.getPosition().pipe(take(1)).subscribe(position => {
				if (position) {
					this.positionChanged.emit(position);
				}
			});
		};
		this._mapObject.on('moveend', this._moveEndListener);
		this._mapObject.on('pointerdown', this._pointerDownListener);
	}

	createView(layer): View {
		return new View({
			projection: layer.getSource().getProjection()
		});
	}

	public resetView(layer: any, position: ICaseMapPosition, extent?: CaseMapExtent, mapId?: string, useDoubleBuffer?: boolean): Observable<boolean> {
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
		this.mapId = mapId;
		if (useDoubleBuffer) {
			this.setMainLayerToBackgroundMap(layer);
			this._backgroundMapObject.setView(view);
			this.savedParams = {
				layer, view, position, extent, rotation
			};
			this.setMainLayerToForegroundMapAfterTilesAreLoaded();
		} else {
			this.setMainLayerToForegroundMap(layer);
			this._mapObject.setView(view);
		}
		this.store$.dispatch(new SetIsLoadingTilesAction({ mapId, value: true }));

		if (useDoubleBuffer) {
			return combineLatest(this.isLoadingLayers$,
				this._setMapPositionOrExtent(this.backgroundMapObject, position, extent, rotation)
			).pipe(
				filter(([isLoadingLayers, bool]) => !isLoadingLayers),
				take(1),
				map(([isLoadingLayers, bool]) => bool)
			);
		} else {
			return this._setMapPositionOrExtent(this.mapObject, position, extent, rotation);
		}
	}

	// Used by resetView()
	private _setMapPositionOrExtent(map: OLMap, position: ICaseMapPosition, extent: CaseMapExtent, rotation: number): Observable<boolean> {
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
		// We need setTimeout for when we do not use double buffer
		setTimeout(() => {
			this.store$.dispatch(new SetIsLoadingTilesAction({ mapId: this.mapId, value: false }));
		}, 0);
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

	fitToExtent(extent: CaseMapExtent, map: OLMap = this.mapObject, view: View = map.getView()) {
		const collection: any = turf.featureCollection([ExtentCalculator.extentToPolygon(extent)]);

		return this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, map).pipe(
			tap((features: olFeature[]) => {
				view.fit(features[0].getGeometry() as olPolygon, { nearest: true, constrainResolution: false });
			})
		);
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

	public get mapObject() {
		return this._mapObject;
	}

	public get backgroundMapObject() {
		return this._backgroundMapObject;
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

	calculateRotateExtent(olmap: OLMap): Observable<{ extentPolygon: CaseMapExtentPolygon, layerExtentPolygon: CaseMapExtentPolygon }> {
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

	fitRotateExtent(olmap: OLMap, extentFeature: Feature<CaseMapExtentPolygon>): Observable<boolean> {
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
				view.setResolution(Math.abs(resolution));
				this.isValidPosition = true;
				return true;
			})
		);
	}

	public setPosition(position: ICaseMapPosition, map: OLMap = this.mapObject, view: View = map.getView()): Observable<boolean> {
		const { extentPolygon, projectedState } = position;
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
			return this.fitRotateExtent(map, extentFeature);
		}
	}

	public getPosition(): Observable<ICaseMapPosition> {
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

			if (this.coreConfig.needToUseLayerExtent && this.needToUseLayerExtent(layerExtentPolygon, extentPolygon)) {
				extentPolygon = layerExtentPolygon;
			}

			return { extentPolygon, projectedState };
		}));
	}

	needToUseLayerExtent(layerExtentPolygon: CaseMapExtentPolygon, extentPolygon: CaseMapExtentPolygon) {
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

	// BaseImageryMap End
	public dispose() {
		this.removeAllLayers();

		if (this._mapObject) {
			this._mapObject.un('moveend', this._moveEndListener);
			this._mapObject.un('pointerdown', this._pointerDownListener);
			this._mapObject.setTarget(null);
		}

		if (this._backgroundMapObject) {
			this._backgroundMapObject.setTarget(null);
		}
	}
}
