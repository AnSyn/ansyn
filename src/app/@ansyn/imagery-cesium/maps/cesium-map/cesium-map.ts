import {
	BaseImageryMap,
	ExtentCalculator, ICanvasExportData,
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
		handler.setInputAction((movement) => {
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

	getCoordinateFromScreenPixel(screenPixel: { x, y }): [number, number, number] {
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

	getExportData(): ICanvasExportData {
		// @TODO: get cesium real map image.
		this.mapObject.render();
		const c = this.mapObject.canvas;
		let exportData: ICanvasExportData = {
			width: c.width,
			height: c.height,
			data: 'data:image/png;base64,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'
		};
		try {
			exportData = {
				width: c.width,
				height: c.height,
				data: c.toDataURL()
			}
		}catch (e) {
		}
		return exportData;
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

	resetView(layer: CesiumLayer, position: ImageryMapPosition, extent ?: ImageryMapExtent): Observable<boolean> {
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

	setCameraView(heading: number, pitch: number, roll: number, destination: [number, number, number]) {
		this.mapObject.camera.setView({
			destination: Cesium.Cartesian3.fromDegrees(
				destination[0],
				destination[1],
				destination[2]
			),
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
			this.setCameraView(position.projectedState.rotation, position.projectedState.pitch, position.projectedState.roll, position.projectedState.center);
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
			const center = this.getInnerCenter();
			const projectedState: ImageryMapProjectedState = {
				center: [center.coordinates[0], center.coordinates[1], center.coordinates[2]],
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
			this.setCameraView(rotation, this.mapObject.camera.pitch, this.mapObject.camera.roll, [center.coordinates[0], center.coordinates[1], center.coordinates[2]]);
		}
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
