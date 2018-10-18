import OLMap from 'ol/map';
import View from 'ol/view';
import ScaleLine from 'ol/control/scaleline';
import Group from 'ol/layer/group';
import olGeoJSON from 'ol/format/geojson';
import OLGeoJSON from 'ol/format/geojson';
import Vector from 'ol/source/vector';
import Layer from 'ol/layer/layer';
import VectorLayer from 'ol/layer/vector';
import olFeature from 'ol/feature';
import olPolygon from 'ol/geom/polygon';
import AttributionControl from 'ol/control/attribution';
import * as turf from '@turf/turf';
import { ExtentCalculator } from '../utils/extent-calculator';
import { BaseImageryMap, ImageryMap, ProjectionService } from '@ansyn/imagery';
import { Observable, of, throwError } from 'rxjs';
import { Feature, FeatureCollection, GeoJsonObject, GeometryObject, Point as GeoPoint, Polygon } from 'geojson';
import { OpenLayersMousePositionControl } from '../openlayers-map/openlayers-mouseposition-control';
import { areCoordinatesNumeric, CaseMapExtent, CaseMapExtentPolygon, CoreConfig, ICaseMapPosition, ICoreConfig } from '@ansyn/core';
import * as olShare from '../shared/openlayers-shared';
import { Utils } from '../utils/utils';
import { Inject } from '@angular/core';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { feature, bboxPolygon, booleanContains } from '@turf/turf';

export const OpenlayersMapName = 'openLayersMap';

export enum StaticGroupsKeys {
	layers = 'layers'
}

// @dynamic
@ImageryMap({
	mapType: OpenlayersMapName,
	deps: [ProjectionService, CoreConfig]
})
export class OpenLayersMap extends BaseImageryMap<OLMap> {
	static groupsKeys = StaticGroupsKeys;
	static groupLayers = new Map<StaticGroupsKeys, Group>(Object.values(StaticGroupsKeys).map((key) => [key, new Group()]) as any);
	private showGroups = new Map<StaticGroupsKeys, boolean>();
	private _mapObject: OLMap;

	private _moveEndListener: () => void;
	private olGeoJSON: OLGeoJSON = new OLGeoJSON();
	private _mapLayers = [];
	public isValidPosition;


	constructor(public projectionService: ProjectionService, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
		super();
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

	initMap(target: HTMLElement, layers: any, position?: ICaseMapPosition): Observable<boolean> {
		this._mapLayers = [];
		const controls = [
			new ScaleLine(),
			new AttributionControl(),
			new OpenLayersMousePositionControl({
					projection: 'EPSG:4326',
					coordinateFormat: (coords: ol.Coordinate): string => coords.map((num) => +num.toFixed(4)).toString()
				},
				(point) => this.projectionService.projectApproximately(point, this))
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
		return this.resetView(layers[0], position);
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
	}

	createView(layer): View {
		return new View({
			projection: layer.getSource().getProjection()
		});
	}

	public resetView(layer: any, position: ICaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		this.isValidPosition = false;
		const rotation = this._mapObject.getView() && this.mapObject.getView().getRotation();
		const view = this.createView(layer);
		this.setMainLayer(layer);
		this._mapObject.setView(view);

		// set default values to prevent map Assertion error's
		view.setCenter([0, 0]);
		view.setRotation(rotation ? rotation : 0);
		view.setResolution(1);

		if (extent) {
			this.fitToExtent(extent).subscribe();
			if (rotation) {
				this.mapObject.getView().setRotation(rotation);
			}
			this.isValidPosition = true;
		} else if (position) {
			return this.setPosition(position);
		}

		return of(true);
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

	setMainLayer(layer: Layer) {
		layer.set('name', 'main');
		layer.set('mainExtent', null);
		this.removeAllLayers();
		this.addLayer(layer);
		this.setGroupLayers();
	}

	getMainLayer(): Layer {
		let mainLayer = this._mapLayers.find((layer: Layer) => layer.get('name') === 'main');
		return mainLayer;
	}

	fitToExtent(extent: CaseMapExtent, view: View = this.mapObject.getView()) {
		const collection: any = turf.featureCollection([ExtentCalculator.extentToPolygon(extent)]);

		return this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, this).pipe(
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

	public setCenter(center: GeoPoint, animation: boolean): Observable<boolean> {
		return this.projectionService.projectAccuratelyToImage(center, this).pipe(map(projectedCenter => {
			const olCenter = <ol.Coordinate> projectedCenter.coordinates;
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
		const point = <GeoPoint> turf.geometry('Point', center);

		return this.projectionService.projectAccurately(point, this);
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

		const cachedMainExtent = mainLayer.get('mainExtent');
		const mainExtent = mainLayer.getExtent();
		if (mainExtent && !Boolean(cachedMainExtent)) {
			const layerExtentPolygon = Utils.extentToOlPolygon(mainExtent);
			return this.projectionService.projectCollectionAccurately([new olFeature(new olPolygon(coordinates)), new olFeature(layerExtentPolygon)], this).pipe(
				map((collection: FeatureCollection<GeometryObject>) => {
					mainLayer.set('mainExtent', collection.features[1].geometry as Polygon);
					return {
						extentPolygon: collection.features[0].geometry as Polygon,
						layerExtentPolygon: collection.features[1].geometry as Polygon
					};
				})
			);
		}
		return this.projectionService.projectCollectionAccurately([new olFeature(new olPolygon(coordinates))], this)
			.pipe(map((collection: FeatureCollection<GeometryObject>) => {
				return {
					extentPolygon: collection.features[0].geometry as Polygon,
					layerExtentPolygon: cachedMainExtent
				};
			}));
	}

	fitRotateExtent(olmap: OLMap, extentFeature: Feature<CaseMapExtentPolygon>): Observable<boolean> {
		const collection: any = turf.featureCollection([extentFeature]);

		return this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, this).pipe(
			map((features: olFeature[]) => {
				const view: View = olmap.getView();
				const geoJsonFeature = <any> this.olGeoJSON.writeFeaturesObject(features,
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

	public setPosition(position: ICaseMapPosition, view: View = this.mapObject.getView()): Observable<boolean> {
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
		}
		const extentFeature = feature(extentPolygon);
		const layerExtent = new olFeature(new olPolygon(<any>bboxPolygon(this.getMainLayer().getExtent()).geometry.coordinates));
		return this.projectionService.projectCollectionApproximately([layerExtent], this)
			.pipe(
				take(1),
				mergeMap((extent4326: FeatureCollection<GeometryObject>) => {
					const [layerExtentFeature] = extent4326.features;
					if (booleanContains(layerExtentFeature, extentFeature)) {
						return this.fitRotateExtent(this.mapObject, extentFeature);
					}
					return of(false)
				})
			);
	}

	public getPosition(): Observable<ICaseMapPosition> {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const projectedState = { ...(<any>view).getState(), projection: { code: projection.getCode() } };

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
			this._mapObject.setTarget(null);
		}

	}
}
