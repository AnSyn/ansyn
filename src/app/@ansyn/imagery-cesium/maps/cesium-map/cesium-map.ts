import { GeoJsonObject, Point, Polygon } from 'geojson';
import { Observable, of } from 'rxjs';
import {
	BaseImageryMap,
	ImageryMap,
	ImageryMapExtent,
	ImageryMapPosition,
	toDegrees,
	ExtentCalculator
} from '@ansyn/imagery';
import { Inject } from '@angular/core';
import { feature, geometry } from '@turf/turf';
import { featureCollection } from '@turf/helpers';
import { map, mergeMap, take } from 'rxjs/operators';
import { CesiumProjectionService } from '../../projection/cesium-projection.service';

import { fromPromise } from 'rxjs/internal-compatibility';
import { CesiumLayer, ISceneMode } from '../../models/cesium-layer';

declare const Cesium: any;

Cesium.buildModuleUrl.setBaseUrl('assets/Cesium/');
Cesium.BingMapsApi.defaultKey = 'AnjT_wAj_juA_MsD8NhcEAVSjCYpV-e50lUypkWm1JPxVu0XyVqabsvD3r2DQpX-';

export const CesiumMapName = 'CesiumMap';

// @dynamic
@ImageryMap({
	mapType: CesiumMapName,
	deps: [CesiumProjectionService]
})
export class CesiumMap extends BaseImageryMap<any> {
	static groupLayers = new Map<string, any>();
	mapObject: any;
	element: HTMLElement;
	_moveEndListener;
	_mouseMoveHandler;

	constructor(public projectionService: CesiumProjectionService) {
		super();
	}

	initMap(element: HTMLElement, shadowElement: HTMLElement, shadowDoubleBufferElement: HTMLElement, layer: any, position?: ImageryMapPosition): Observable<boolean> {
		this.element = element;

		return this.resetView(layer, position);
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
		this._mouseMoveHandler = this.registerMouseMoveEvent();
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

	registerMouseMoveEvent(): any {
		const handler = new Cesium.ScreenSpaceEventHandler(this.mapObject.scene.canvas);
		handler.setInputAction((movement) => {
			// Cesium's camera.pickEllipsoid works in 2D, 2.5D (Columbus View), and 3D.
			// PickEllipsoid produces a coordinate on the surface of the 3D globe,
			// but this can easily be converted to a latitude/longitude coordinate
			// using Cesium.Cartographic.fromCartesian.
			const cartesian = this.mapObject.camera.pickEllipsoid(movement.endPosition, this.mapObject.scene.globe.ellipsoid);
			if (cartesian) {
				const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

				this.mousePointerMoved.emit({
					long: +Cesium.Math.toDegrees(cartographic.longitude).toFixed(10),
					lat: +Cesium.Math.toDegrees(cartographic.latitude).toFixed(10),
					height: cartographic.height});
				// entity.label.text =
				// 	'Lon: ' + ('   ' + longitudeString).slice(-10) + '\u00B0' + ' Lat: ' + ('   ' + latitudeString).slice(-10) + '\u00B0';
			} else {
				this.mousePointerMoved.emit({
					long: NaN,
					lat: NaN,
					height: NaN});
				console.log("NaN");
			}

		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		return handler;
	}

	unregisterMouseMoveEvent(handler) {
		handler = handler && handler.destroy();
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
				baseLayerPicker: false,
				sceneModePicker: false,
				timeline: false,
				navigationHelpButton: false,
				navigationInstructionsInitiallyVisible: false,
				animation: false,
				fullscreenButton: false,
				homeButton: false,
				infoBox: false,
				geocoder: false
			});

			// Set the global imagery layer to fully transparent and set the globe's base color to black
			// const baseImageryLayer = viewer.imageryLayers.get(0);
			// baseImageryLayer.alpha = 0.0;
			viewer.scene.globe.baseColor = Cesium.Color.BLACK;
			this.mapObject = viewer;
			this.initListeners();
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

	resetView(layer: CesiumLayer, position: ImageryMapPosition, extent?: ImageryMapExtent): Observable<boolean> {
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

	fitToExtent(extent: ImageryMapExtent) {
		const polygon = ExtentCalculator.extentToPolygon(extent);
		return this.internalSetPosition((<any>polygon.geometry));
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(position: ImageryMapPosition): Observable<boolean> {
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

	getPosition(): Observable<ImageryMapPosition> {
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
			this.unregisterMouseMoveEvent(this._mouseMoveHandler);
			this.mapObject.destroy();
		}
	}

	set2DPosition(go_north: boolean = false): Observable<any> {

		if (this.mapObject.scene.mode === Cesium.SceneMode.SCENE2D) {
			return;
		}

		if (Math.cos(this.mapObject.camera.pitch) < 0.001) {
			return;
		}

		return new Observable<any>(obs => {
			let position;
			try {
				const rect = this.mapObject.canvas.getBoundingClientRect();
				const center = new Cesium.Cartesian2(rect.width / 2, rect.height / 2);
				position = this.mapObject.camera.pickEllipsoid(center, this.mapObject.scene.globe.ellipsoid);
				let cartographic = Cesium.Cartographic.fromCartesian(position);
				cartographic.height = this.mapObject.camera.positionCartographic.height;

				position = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
			} catch (err) {
				position = this.mapObject.camera.position;
			}

			let flyToObj = {
				destination: position,
				easingFunction: Cesium.EasingFunction.LINEAR_NONE,
				orientation: {
					heading: go_north ? 0 : this.mapObject.camera.heading,
					pitch: Cesium.Math.toRadians(-90.0), // look down
					roll: 0.0 // no change
				},
				duration: 0.5,
				complete: () => {
					this.getPosition().pipe(take(1)).subscribe(position => {
						if (position) {
							this.positionChanged.emit(position);
						}
						obs.next(true);
					});
				}
			};
			this.mapObject.camera.flyTo(flyToObj);
		});
	}
}
