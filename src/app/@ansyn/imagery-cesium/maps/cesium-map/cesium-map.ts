import {
	BaseImageryMap,
	ExtentCalculator,
	ICanvasExportData,
	ImageryMap,
	ImageryMapExtent,
	ImageryMapPosition,
	ImageryMapProjectedState,
	toDegrees
} from '@ansyn/imagery';
import { featureCollection } from '@turf/helpers';
import { feature, geometry } from '@turf/turf';
import { GeoJsonObject, Point, Polygon } from 'geojson';
import { Observable, of } from 'rxjs';

import { fromPromise } from 'rxjs/internal-compatibility';
import { map, mergeMap, take } from 'rxjs/operators';
import { CesiumLayer, ISceneMode } from '../../models/cesium-layer';
import { CesiumProjectionService } from '../../projection/cesium-projection.service';
import { Cartesian2, Cartesian3, Viewer } from 'cesium';

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
	mapObject: Viewer;
	element: HTMLElement;
	_moveEndListener;
	_mouseMoveHandler;
	lastRotation = 0;

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
		this._mouseMoveHandler = this.registerScreenEvents();
	}

	getCenter(): Observable<Point> {
		const point = this.getInnerCenter();
		return of(point);
	}

	getInnerCenter() {
		const viewer = this.mapObject;
		// const windowPosition = new Cesium.Cartesian2(viewer.container.clientWidth / 2, viewer.container.clientHeight / 2);
		// const pickRay = viewer.scene.camera.getPickRay(windowPosition);
		// const pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
		// const pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
		const rect = this.mapObject.camera.computeViewRectangle(this.mapObject.scene.globe.ellipsoid);
		const centerRect = Cesium.Rectangle.center(rect);

		const longitude = Cesium.Math.toDegrees(centerRect.longitude);
		const latitude = Cesium.Math.toDegrees(centerRect.latitude);
		const height = this.mapObject.camera.positionCartographic.height;
		// TODO: add projection
		const point: Point = {
			type: 'Point',
			coordinates: [longitude, latitude, height]
		};
		return point;
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

	registerScreenEvents(): any {
		const handler = new Cesium.ScreenSpaceEventHandler(this.mapObject.scene.canvas);
		handler.setInputAction((movement: { startPosition: Cartesian2, endPosition: Cartesian2 }) => {
			// Cesium's camera.pickEllipsoid works in 2D, 2.5D (Columbus View), and 3D.
			// PickEllipsoid produces a coordinate on the surface of the 3D globe,
			// but this can easily be converted to a latitude/longitude coordinate
			// using Cesium.Cartographic.fromCartesian.
			const latLongCoord: [number, number, number] = this.getCoordinateFromScreenPixel(movement.endPosition);
			if (latLongCoord) {
				this.mousePointerMoved.emit({
					long: latLongCoord[0],
					lat: latLongCoord[1],
					height: latLongCoord[2]
				});
			} else {
				this.mousePointerMoved.emit({ long: NaN, lat: NaN, height: NaN });
			}

		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		handler.setInputAction(function (movement) {
			(<any>document.activeElement).blur();
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

		handler.setInputAction(function (movement) {
			(<any>document.activeElement).blur();
		}, Cesium.ScreenSpaceEventType.WHEEL);

		handler.setInputAction(function (movement) {
			(<any>document.activeElement).blur();
		}, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

		handler.setInputAction(function (movement) {
			(<any>document.activeElement).blur();
		}, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

		handler.setInputAction(function (movement) {
			(<any>document.activeElement).blur();
		}, Cesium.ScreenSpaceEventType.PINCH_START);
		return handler;
	}

	unregisterScreenEvents(handler) {
		handler = handler && handler.destroy();
	}

	getCoordinateFromScreenPixel(screenPixel: Cartesian2): [number, number, number] {
		const cartesian = this.mapObject.camera.pickEllipsoid(screenPixel, this.mapObject.scene.globe.ellipsoid);
		if (cartesian) {
			const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

			const result: [number, number, number] = [+Cesium.Math.toDegrees(cartographic.longitude).toFixed(10), +Cesium.Math.toDegrees(cartographic.latitude).toFixed(10), +cartographic.height.toFixed(10)];
			return result;
		}
		return null;
	}

	getHtmlContainer(): HTMLElement {
		return <HTMLElement>this.element;
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
						terrainProvider: Cesium.createWorldTerrain(),
						mapProjection: layer.mapProjection,
						sceneMode: cesiumSceneMode,
						imageryProvider: layer.layer,
						shadows: false,
						automaticallyTrackDataSourceClocks: false
					});

					// Set the global imagery layer to fully transparent and set the globe's base color to black
					// const baseImageryLayer = viewer.imageryLayers.get(0);
					// baseImageryLayer.alpha = 0.0;
					this.mapObject = viewer;
					this.mapObject.imageryLayers.addImageryProvider(layer.layer);
					this.initListeners();
					this.setCesuimImprovements();
					return true;
				})
			);
		} else {
			const viewer = new Cesium.Viewer(this.element, {
				terrainProvider: Cesium.createWorldTerrain(),
				sceneMode: cesiumSceneMode,
				imageryProvider: layer.layer,
				baseLayerPicker: false,
				sceneModePicker: false,
				timeline: false,
				navigationHelpButton: false,
				navigationInstructionsInitiallyVisible: false,
				animation: false,
				fullscreenButton: false,
				homeButton: false,
				infoBox: false,
				geocoder: false,
				shadows: false,
				automaticallyTrackDataSourceClocks: false,
				orderIndependentTranslucency: false
			});

			// Set the global imagery layer to fully transparent and set the globe's base color to black
			// const baseImageryLayer = viewer.imageryLayers.get(0);
			// baseImageryLayer.alpha = 0.0;
			this.mapObject = viewer;
			this.initListeners();
		}

		this.setCesuimImprovements();
		return of(true);
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

	resetView(layer: CesiumLayer, position: ImageryMapPosition, extent ?: ImageryMapExtent): Observable<boolean> {
		if (!this.mapObject || (layer.mapProjection && (<any>this.mapObject.scene.mapProjection).projectionName !== layer.mapProjection.projectionName)) {
			return this.createMapObject(layer).pipe(
				mergeMap((isReady) => {
					if (extent) {
						return this.fitToExtent(extent);
					}
					return this.setPosition(position);
				}));
		}

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

	setCesuimImprovements() {
		this.mapObject.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		(<any>this.mapObject)._enableInfoOrSelection = false;
		Cesium.Label.enableRightToLeftDetection = true;

		this.mapObject.scene.globe.depthTestAgainstTerrain = false;
		this.mapObject.resolutionScale = 1;
		this.mapObject.scene.useDepthPicking = false;
		this.mapObject.scene.postProcessStages.fxaa.enabled = false;
		// const SKY_COLOR = 'rgb(81,202,232)';
		// this.mapObject.scene.backgroundColor = Cesium.Color.fromCssColorString(SKY_COLOR);
		// this.mapObject.scene.globe.baseColor = Cesium.Color.fromCssColorString(SKY_COLOR);
		this.mapObject.trackedEntityChanged.addEventListener(() => {
			this.mapObject.trackedEntity = undefined;
		});

		this.mapObject.shadowMap.enabled = false;
		this.mapObject.scene.skyBox.show = false;
		this.mapObject.scene.sunBloom = false;
		this.mapObject.scene.fog.enabled = false;
		this.mapObject.scene.sun.show = false;
		this.mapObject.scene.moon.show = false;
		this.mapObject.scene.globe.showWaterEffect = false;
		(<any>this.mapObject.scene.globe).showGroundAtmosphere = false;

		let originalRotateUp = Cesium.Camera.prototype.rotateUp;
		Cesium.Camera.prototype.rotateUp = function (angle) {
			const maxAngle = -0.1;
			if (angle > 0 && this.pitch + angle > maxAngle) {
				angle = maxAngle - this.pitch;
			}
			originalRotateUp.call(this, angle);
		};
		Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
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

	setCameraView(heading: number, pitch: number, roll: number, destination: Cartesian3) {
		this.mapObject.camera.setView({
			destination: destination,
			orientation: {
				heading: heading,
				pitch: pitch,
				roll: roll
			}
		});
	}

	setPosition(position: ImageryMapPosition): Observable<boolean> {
		if (position.projectedState && position.projectedState.projection &&
			position.projectedState.projection.code === 'cesium_WGS84') {
			this.setCameraView(position.projectedState.rotation, position.projectedState.pitch, position.projectedState.roll, position.projectedState.cameraPosition);
			return of(true);
		} else {
			const { extentPolygon } = position;
			return this.internalSetPosition(extentPolygon);
		}
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

	_imageToGround(cartesian2: Cartesian2) {
		const position = this.mapObject.camera.getPickRay(cartesian2);
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
			const center = this.getInnerCenter();
			const projectedState: ImageryMapProjectedState = {
				center: [center.coordinates[0], center.coordinates[1], center.coordinates[2]],
				cameraPosition: this.mapObject.camera.position,
				rotation: +this.mapObject.camera.heading.toFixed(7),
				pitch: +this.mapObject.camera.pitch.toFixed(7),
				roll: +this.mapObject.camera.roll.toFixed(7),
				projection: {
					code: 'cesium_WGS84'
				}
			};

			const rect = this.mapObject.camera.computeViewRectangle(this.mapObject.scene.globe.ellipsoid);
			const north: number = +Cesium.Math.toDegrees(rect.north).toFixed(10);
			const east: number = +Cesium.Math.toDegrees(rect.east).toFixed(10);
			const south: number = +Cesium.Math.toDegrees(rect.south).toFixed(10);
			const west: number = +Cesium.Math.toDegrees(rect.west).toFixed(10);
			const topLeft = [west, north];
			const topRight = [east, north];
			const bottomLeft = [west, south];
			const bottomRight = [east, south];

			// const bounds = this.getBounds();
			// console.log('bounds: ', bounds);
			// const center1 = new Cesium.Cartesian2(rect.width / 2, rect.height / 2);
			// let position = this.mapObject.camera.pickEllipsoid(center1, this.mapObject.scene.globe.ellipsoid);
			// let cartographic = Cesium.Cartographic.fromCartesian(position);
			// cartographic.height = this.mapObject.camera.positionCartographic.height;

			// position = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);

			// const { height, width } = this.mapObject.canvas;
			// const topLeft = this._imageToGround({ x: 0, y: 0 });
			// const topRight = this._imageToGround({ x: width, y: 0 });
			// const bottomRight = this._imageToGround({ x: width, y: height });
			// const bottomLeft = this._imageToGround({ x: 0, y: height });
			const extentPolygon = <Polygon>geometry('Polygon', [[topLeft, topRight, bottomRight, bottomLeft, topLeft]]);
			// const extentPolygon = <Polygon>geometry('Polygon', [[topLeft, bottomLeft, bottomRight, topRight, topLeft]]);
			return of({ extentPolygon, projectedState });
		} catch (error) {
			return of(null);
		}
	}

	setRotation(rotation: number): void {
		if (this.mapObject && this.mapObject.camera) {
			const center = this.getInnerCenter();
			const position = Cesium.Cartesian3.fromDegrees(center.coordinates[0], center.coordinates[1], center.coordinates[2]);
			this.setCameraView(rotation, this.mapObject.camera.pitch, this.mapObject.camera.roll, position);
		}
	}

	zoomIn(): void {
		this.mapObject.camera.zoomIn();
	}

	zoomOut(): void {
		this.mapObject.camera.zoomOut();
	}

	one2one(): void {
		this.mapObject.resolutionScale = 1
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
		if (this.mapObject && this.mapObject.camera) {
			const rotation = +this.mapObject.camera.heading.toFixed(7);
			const lastRotationDeg = toDegrees(this.lastRotation) % 360;
			const currentRotationDeg = toDegrees(rotation) % 360;
			if (Math.abs(Math.abs(lastRotationDeg) - Math.abs(currentRotationDeg)) < 0.0001 ||
				Math.abs(Math.abs(lastRotationDeg) - Math.abs(currentRotationDeg)) > 359.9999) {
				return this.lastRotation;
			}
			this.lastRotation = rotation;
			return rotation;
		}
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
			this.unregisterScreenEvents(this._mouseMoveHandler);
			this.mapObject.destroy();
			this.mapObject = null;
		}
	}

	set2DPosition(go_north: boolean = false): Observable<any> {

		if (this.mapObject.scene.mode === Cesium.SceneMode.SCENE2D) {
			return of(true);
		}

		if (Math.cos(this.mapObject.camera.pitch) < 0.001) {
			return of(true);
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
