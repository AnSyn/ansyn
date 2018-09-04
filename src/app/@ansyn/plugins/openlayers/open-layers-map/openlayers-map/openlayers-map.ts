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
import { ExtentCalculator } from '@ansyn/core/utils/extent-calculator';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { Observable } from 'rxjs';
import { FeatureCollection, GeoJsonObject, GeometryObject, Point as GeoPoint, Polygon } from 'geojson';
import { OpenLayersMousePositionControl } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-mouseposition-control';
import 'rxjs/add/operator/take';
import { CaseMapExtent, CaseMapExtentPolygon, ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { areCoordinatesNumeric } from '@ansyn/core/utils/geo';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { ImageryMap } from '@ansyn/imagery/decorators/imagery-map';
import { BaseImageryMap } from '@ansyn/imagery/model/base-imagery-map';
import * as olShare from '../shared/openlayers-shared';

export const OpenlayersMapName = 'openLayersMap';

enum StaticGroupsKeys {
	layers = 'layers'
}

// @dynamic
@ImageryMap({
	mapType: OpenlayersMapName,
	deps: [ProjectionService]
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


	constructor(public projectionService: ProjectionService) {
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
		this._mapObject = new OLMap({ target, renderer, controls, loadTilesWhileInteracting: true, loadTilesWhileAnimating: true });
		this.initListeners();
		return this.resetView(layers[0], position);
	}

	initListeners() {
		this._moveEndListener = () => {
			this.getPosition().take(1).subscribe(position => {
				if (position) {
					this.positionChanged.emit(position);
				}
			})
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
			this.fitToExtent(extent);
			if (rotation) {
				this.mapObject.getView().setRotation(rotation);
			}
			this.isValidPosition = true;
		} else if (position) {
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

	setMainLayer(layer: Layer) {
		layer.set('name', 'main');
		this.removeAllLayers();
		this.addLayer(layer);
		this.setGroupLayers();
	}

	fitToExtent(extent: CaseMapExtent, view: View = this.mapObject.getView()) {
		const collection: any = turf.featureCollection([ExtentCalculator.extentToPolygon(extent)]);

		this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, this)
			.subscribe((features: olFeature[]) => {
				view.fit(features[0].getGeometry() as olPolygon, { nearest: true, constrainResolution: false });
			});
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
		const center = this._mapObject.getView().getCenter();
		if (!areCoordinatesNumeric(center)) {
			return;
		}
		this._mapObject.updateSize();
		this._mapObject.renderSync();
	}

	public getCenter(): Observable<GeoPoint> {
		if (!this.isValidPosition) {
			return Observable.of(null);
		}
		const view = this._mapObject.getView();
		const center = view.getCenter();
		if (!areCoordinatesNumeric(center)) {
			return Observable.of(null);
		}
		const point = <GeoPoint> turf.geometry('Point', center);

		return this.projectionService.projectAccurately(point, this);
	}

	calculateRotateExtent(map: OLMap): Observable<CaseMapExtentPolygon> {
		if (!this.isValidPosition) {
			return Observable.of(null);
		}
		const [width, height] = map.getSize();
		const topLeft = map.getCoordinateFromPixel([0, 0]);
		const topRight = map.getCoordinateFromPixel([width, 0]);
		const bottomRight = map.getCoordinateFromPixel([width, height]);
		const bottomLeft = map.getCoordinateFromPixel([0, height]);
		const coordinates = [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
		const someIsNaN = !coordinates[0].every(areCoordinatesNumeric);
		if (someIsNaN) {
			return Observable.of(null);
		}

		return this.projectionService.projectCollectionAccurately([new olFeature(new olPolygon(coordinates))], this)
			.map((collection: FeatureCollection<GeometryObject>) => collection.features[0].geometry as Polygon);
	}

	fitRotateExtent(map: OLMap, extentFeature: CaseMapExtentPolygon): Observable<boolean> {
		const collection: any = turf.featureCollection([turf.feature(extentFeature)]);

		return this.projectionService.projectCollectionAccuratelyToImage<olFeature>(collection, this)
			.map((features: olFeature[]) => {
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
				this.isValidPosition = true;
				return true;
			});
	}

	public setPosition(position: ICaseMapPosition, view: View = this.mapObject.getView()): Observable<boolean> {
		const rotation = this._mapObject.getView().getRotation();
		view.setCenter([0, 0]);
		view.setRotation(rotation ? rotation : 0);
		view.setResolution(1);

		const { extentPolygon, projectedState } = position;
		const viewProjection = view.getProjection();
		const isProjectedPosition = projectedState && viewProjection.getCode() === projectedState.projection.code;
		if (isProjectedPosition) {
			const { center, zoom, rotation } = projectedState;
			view.setCenter(center);
			view.setZoom(zoom);
			view.setRotation(rotation);
			this.isValidPosition = true;
			return Observable.of(true);
		} else {
			return this.fitRotateExtent(this.mapObject, extentPolygon);
		}
	}

	public getPosition(): Observable<ICaseMapPosition> {
		const view = this.mapObject.getView();
		const projection = view.getProjection();
		const projectedState = { ...(<any>view).getState(), projection: { code: projection.getCode() } };
		return this.calculateRotateExtent(this.mapObject).map((extentPolygon: Polygon) => {
			if (!extentPolygon) {
				return null;
			}

			const someIsNaN = !extentPolygon.coordinates[0].every(areCoordinatesNumeric);
			if (someIsNaN) {
				console.warn('ol map getPosition failed invalid coordinates ', extentPolygon);
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
