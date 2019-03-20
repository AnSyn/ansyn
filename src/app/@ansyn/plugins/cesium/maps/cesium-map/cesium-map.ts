import { GeoJsonObject, Point, Polygon } from 'geojson';
import { Observable, of } from 'rxjs';
import { CaseMapExtent, CoreConfig, ExtentCalculator, ICaseMapPosition, ICoreConfig, toDegrees } from '@ansyn/core';
import { BaseImageryMap, ImageryMap } from '@ansyn/imagery';
import { Inject } from '@angular/core';
import { feature, geometry } from '@turf/turf';
import { featureCollection } from '@turf/helpers';
import { map, mergeMap, take } from 'rxjs/operators';
import { CesiumProjectionService } from '../../projection/cesium-projection.service';

import { fromPromise } from "rxjs/internal-compatibility";
import { CesiumLayer, ISceneMode } from "../../models/cesium-layer";

declare const Cesium: any;

Cesium.buildModuleUrl.setBaseUrl('assets/Cesium/');
Cesium.BingMapsApi.defaultKey = 'AnjT_wAj_juA_MsD8NhcEAVSjCYpV-e50lUypkWm1JPxVu0XyVqabsvD3r2DQpX-';

export const CesiumMapName = 'CesiumMap';

// @dynamic
@ImageryMap({
	mapType: CesiumMapName,
	deps: [CesiumProjectionService, CoreConfig]
})
export class CesiumMap extends BaseImageryMap<any> {
	static groupLayers = new Map<string, any>();
	mapObject: any;
	element: HTMLElement;
	_moveEndListener;

	constructor(public projectionService: CesiumProjectionService, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
		super();
	}

	initMap(element: HTMLElement, shadowElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layers: any, position?: ICaseMapPosition): Observable<boolean> {
		this.element = element;

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

		this.mapObject.camera.moveEnd.addEventListener(this._moveEndListener);
	}

	getCenter(): Observable<Point> {
		const viewer = this.mapObject;
		const windowPosition = new Cesium.Cartesian2(viewer.container.clientWidth / 2, viewer.container.clientHeight / 2);
		const pickRay = viewer.scene.camera.getPickRay(windowPosition);
		const pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
		const pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
		const long = toDegrees(pickPositionCartographic.longitude);
		const lat = toDegrees(pickPositionCartographic.latitude);
		// TODO: add projection
		const point: Point = {
			type: 'Point',
			coordinates: [long, lat]
		};
		return of(point);
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		const currentPosition = this.mapObject.camera.positionCartographic;

		const extentFeature = feature(center);
		const collection: any = featureCollection([extentFeature]);
		return this.projectionService.projectCollectionAccuratelyToImage(collection, this).pipe(
			map((geoJsonFeature: any) => {
				const geoJsonCenter = geoJsonFeature.features[0].geometry.coordinates;
				// TODO: add animation == false option
				this.mapObject.camera.flyTo({
					destination: Cesium.Cartesian3.fromDegrees(geoJsonCenter[0], geoJsonCenter[1], currentPosition.height)
				});
				// this.mapObject.camera.setView({
				// 	destination: Cesium.Rectangle.fromDegrees(...rec)
				// });
				return true;
			})
		);
	}

	toggleGroup(groupName: string, newState: boolean) {
		throw new Error('Method not implemented.');
	}

	createMapObject(layer: CesiumLayer): Observable<boolean> {
		let cesiumSceneMode = this.getCesiumSceneMode(layer.sceneMode);
		if (this.mapObject) {
			if (!layer.sceneMode) {
				cesiumSceneMode = this.mapObject.scene.mode;
			}
			this.internalDestroyCesium();
		}

		if (layer.mapProjection) {
			return fromPromise(layer.mapProjection.readyPromise).pipe(
				map(() => {
					const viewer = new Cesium.Viewer(this.element, {
						mapProjection: layer.mapProjection,
						sceneMode: cesiumSceneMode,
						imageryLayers: [layer.layer],
						baseLayerPicker: true
					});

					// Set the global imagery layer to fully transparent and set the globe's base color to black
					// const baseImageryLayer = viewer.imageryLayers.get(0);
					// baseImageryLayer.alpha = 0.0;
					viewer.scene.globe.baseColor = Cesium.Color.BLACK;
					this.mapObject = viewer;
					this.mapObject.imageryLayers.addImageryProvider(layer.layer);
					this.initListeners();
					return true;
				})
			);
		} else {
			const viewer = new Cesium.Viewer(this.element, {
				sceneMode: cesiumSceneMode,
				imageryLayers: [layer.layer],
				baseLayerPicker: true
			});

			// Set the global imagery layer to fully transparent and set the globe's base color to black
			// const baseImageryLayer = viewer.imageryLayers.get(0);
			// baseImageryLayer.alpha = 0.0;
			viewer.scene.globe.baseColor = Cesium.Color.BLACK;
			this.mapObject = viewer;
			return of(true);
		}
	}

	getCesiumSceneMode(sceneMode: ISceneMode): any {
		switch (sceneMode) {
			case ISceneMode.COLUMBUS_VIEW: {
				return Cesium.SceneMode.COLUMBUS_VIEW;
			}
			case ISceneMode.MORPHING: {
				return Cesium.SceneMode.MORPHING;
			}
			case ISceneMode.SCENE2D: {
				return Cesium.SceneMode.SCENE2D;
			}
			case ISceneMode.SCENE3D: {
				return Cesium.SceneMode.SCENE3D;
			}
			default: {
				console.warn('un supported scene mode ', sceneMode);
				return Cesium.SceneMode.SCENE2D;
			}
		}
	}

	resetView(layer: CesiumLayer, position: ICaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		if (!this.mapObject || (layer.mapProjection && this.mapObject.scene.mapProjection.projectionName !== layer.mapProjection.projectionName)) {
			return this.createMapObject(layer).pipe(
				mergeMap((isReady) => {
					if (extent) {
						return this.fitToExtent(extent);
					}
					return this.setPosition(position);
				}))
		}
		;

		// else
		const imageryLayers = this.mapObject.imageryLayers;

		if (layer.removePrevLayers) {
			imageryLayers.removeAll(false);
		}

		imageryLayers.addImageryProvider(layer.layer);
		if (layer.terrainProvider) {
			this.mapObject.terrainProvider = layer.terrainProvider;
		}

		if (layer.sceneMode) {
			let cesiumSceneMode = this.getCesiumSceneMode(layer.sceneMode);
			this.mapObject.scene.mode = cesiumSceneMode;
		}

		if (extent) {
			return this.fitToExtent(extent);
		}
		return this.setPosition(position);
	}

	fitToExtent(extent: CaseMapExtent) {
		const polygon = ExtentCalculator.extentToPolygon(extent);
		return this.internalSetPosition((<any>polygon.geometry));
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(position: ICaseMapPosition): Observable<boolean> {
		const { extentPolygon } = position;
		return this.internalSetPosition(extentPolygon);
	}

	internalSetPosition(extentPolygon: Polygon): Observable<boolean> {
		const extentFeature = feature(extentPolygon);
		const collection: any = featureCollection([extentFeature]);
		return this.projectionService.projectCollectionAccuratelyToImage(collection, this).pipe(
			map((geoJsonFeature: any) => {
				const geoJsonExtent = geoJsonFeature.features[0].geometry;
				const rec = [...geoJsonExtent.coordinates[0][0], ...geoJsonExtent.coordinates[0][2]];
				this.mapObject.camera.setView({
					destination: Cesium.Rectangle.fromDegrees(...rec)
				});
				return true;
			})
		);
	}

	_imageToGround({ x, y }: { x: number, y: number }) {
		const position = this.mapObject.camera.getPickRay({ x, y });
		const cartesian = this.mapObject.scene.globe.pick(position, this.mapObject.scene);
		if (cartesian) {
			const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			const longitude = Cesium.Math.toDegrees(cartographic.longitude);
			const latitude = Cesium.Math.toDegrees(cartographic.latitude);
			return [longitude, latitude];
		} else {
			throw new Error('Empty Point');
		}
	}

	getPosition(): Observable<ICaseMapPosition> {
		try {
			const { height, width } = this.mapObject.canvas;
			const topLeft = this._imageToGround({ x: 0, y: 0 });
			const topRight = this._imageToGround({ x: width, y: 0 });
			const bottomRight = this._imageToGround({ x: width, y: height });
			const bottomLeft = this._imageToGround({ x: 0, y: height });
			const extentPolygon = <Polygon>geometry('Polygon', [[topLeft, topRight, bottomRight, bottomLeft, topLeft]]);
			return of({ extentPolygon });
		} catch (error) {
			return of(null);
		}
	}

	setRotation(rotation: number): void {
		throw new Error('Method not implemented.');
	}

	updateSize(): void {
		console.log('Update size cesium');
	}

	addGeojsonLayer(data: GeoJsonObject) {
		throw new Error('Method not implemented.');
	}

	setAutoImageProcessing(shouldPerform: boolean): void {
		throw new Error('Method not implemented.');
	}

	setManualImageProcessing(processingParams: Object): void {
		throw new Error('Method not implemented.');
	}

	setPointerMove(enable: boolean) {
	}

	getPointerMove() {
		return new Observable();
	}

	getLayers(): any[] {
		return [];
	}

	addLayerIfNotExist() {

	}

	getRotation(): number {
		return NaN;
	}

	removeAllLayers(): void {

	}

	public dispose() {
		this.removeAllLayers();
		this.internalDestroyCesium();
	}

	internalDestroyCesium() {
		if (this.mapObject) {
			this.mapObject.camera.moveEnd.removeEventListener(this._moveEndListener);
			this.mapObject.destroy();
		}
	}

}
