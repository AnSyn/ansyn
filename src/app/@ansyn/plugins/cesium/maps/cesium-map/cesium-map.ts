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
	deps: [CesiumProjectionService, CoreConfig],
	defaultMapSource: 'BING_CESIUM'
})
export class CesiumMap extends BaseImageryMap<any> {
	static groupLayers = new Map<string, any>();
	mapObject: any;
	element: HTMLElement;
	_moveEndListener;

	constructor(public projectionService: CesiumProjectionService, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
		super();
	}

	initMap(element: HTMLElement, shadowElement: HTMLElement, layers: any, position?: ICaseMapPosition): Observable<boolean> {
		this.element = element;

		const cesiumLayer = new CesiumLayer(layers[0]);
		return this.resetView(cesiumLayer, position);
		// return this.loadImageToCesium(element).subscribe(() => {
		// });
	}

	// loadImageToCesium(layer): Observable<CesiumLayer> {
	// 	// return fromPromise(mainLayerProjection.readyPromise).pipe(
	// 	// 	map(() => {
	// 	// 		const viewer = new Cesium.Viewer(element, {
	// 	// 			mapProjection : mainLayerProjection,
	// 	// 			sceneMode : Cesium.SceneMode.SCENE2D,
	// 	// 			baseLayerPicker : true
	// 	// 		});
	// 	//
	// 	// 		// Set the global imagery layer to fully transparent and set the globe's base color to black
	// 	// 		const baseImageryLayer = viewer.imageryLayers.get(0);
	// 	// 		baseImageryLayer.alpha = 0.0;
	// 	// 		viewer.scene.globe.baseColor = Cesium.Color.BLACK;
	// 	//
	// 	// 		// Add Raster TMS
	// 	// 		// This is an image pyramid that depends on the provided mapProjection.
	// 	// 		const limaProvider = Cesium.createTileMapServiceImageryProvider({
	// 	// 			url : 'assets/SampleData/mosaic_2638d8d2-b2e3-45f2-966e-f75c565a5dad/',
	// 	// 			mapProjection : mainLayerProjection
	// 	// 		});
	// 	// 		const rasterTmsLayer = viewer.imageryLayers.addImageryProvider(limaProvider);
	// 	//
	// 	// 		// Create a label entity for showing latitude/longitude and pixel coordinates at the mouse location
	// 	// 		const entity = viewer.entities.add({
	// 	// 			label : {
	// 	// 				show : false,
	// 	// 				showBackground : true,
	// 	// 				font : '14px monospace',
	// 	// 				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
	// 	// 				verticalOrigin : Cesium.VerticalOrigin.TOP,
	// 	// 				pixelOffset : new Cesium.Cartesian2(15, 0)
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	// 	// 		handler.setInputAction(function(movement) {
	// 	// 			// Cesium's camera.pickEllipsoid works in 2D, 2.5D (Columbus View), and 3D.
	// 	// 			// Just make sure the main layer's projection is valid.
	// 	// 			// PickEllipsoid produces a coordinate on the surface of the 3D globe,
	// 	// 			// but this can easily be converted to a latitude/longitude coordinate
	// 	// 			// using Cesium.Cartographic.fromCartesian.
	// 	// 			const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
	// 	// 			if (cartesian) {
	// 	// 				const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
	// 	// 				const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
	// 	// 				const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
	// 	//
	// 	// 				const pixelCoordinate = mainLayerProjection.project(cartographic);
	// 	//
	// 	// 				entity.position = cartesian;
	// 	// 				entity.label.show = true;
	// 	// 				entity.label.text =
	// 	// 					'Lon: ' + ('   ' + longitudeString).slice(-10) + '\u00B0' +
	// 	// 					'\nLat: ' + ('   ' + latitudeString).slice(-10) + '\u00B0' +
	// 	// 					'\nx: ' + Math.floor(pixelCoordinate.x) +
	// 	// 					'\ny: ' + Math.floor(-pixelCoordinate.y);
	// 	// 			} else {
	// 	// 				entity.label.show = false;
	// 	// 			}
	// 	// 		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	// 	//
	// 	// 		/*** Add some entities to mark up the view ***/
	// 	//
	// 	// 			// Rectangle roughly around image - projection is slightly skewed
	// 	// 		const imageWidth = 8288;
	// 	// 		const imageHeight = 1984;
	// 	// 		const bottomLeftCornerGeographic = mainLayerProjection.unproject(new Cesium.Cartesian3(0, 0, 0));
	// 	// 		const topRightCornerGeographic = mainLayerProjection.unproject(new Cesium.Cartesian3(imageWidth, -imageHeight));
	// 	// 		const imageBoundsRectangle = viewer.entities.add({
	// 	// 			rectangle : {
	// 	// 				coordinates : Cesium.Rectangle.fromCartographicArray([bottomLeftCornerGeographic, topRightCornerGeographic]),
	// 	// 				material : Cesium.Color.GREEN.withAlpha(0.0),
	// 	// 				height : 0.0,
	// 	// 				outline : true,
	// 	// 				outlineColor : Cesium.Color.WHITE
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		// Polygons around building, points specified in pixel space
	// 	// 		const building1Coordinates = [1981, 641, 2069, 535, 2119, 575, 2031, 685];
	// 	// 		const building2Coordinates = [2035, 685, 2113, 592, 2158, 632, 2081, 724];
	// 	// 		const building3Coordinates = [2085, 730, 2157, 645, 2201, 685, 2131, 769];
	// 	// 		const building4Coordinates = [2319, 759, 2236, 858, 2262, 882, 2271, 870, 2293, 887, 2365, 798];
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in pixel space',
	// 	// 			polygon: {
	// 	// 				hierarchy: pixelSpaceToCartesianSpace(building1Coordinates, mainLayerProjection),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in pixel space',
	// 	// 			polygon: {
	// 	// 				hierarchy: pixelSpaceToCartesianSpace(building2Coordinates, mainLayerProjection),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in pixel space',
	// 	// 			polygon: {
	// 	// 				hierarchy: pixelSpaceToCartesianSpace(building3Coordinates, mainLayerProjection),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in pixel space',
	// 	// 			polygon: {
	// 	// 				hierarchy: pixelSpaceToCartesianSpace(building4Coordinates, mainLayerProjection),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		// Polygons around building, points specified in cartographic space
	// 	// 		const building5Coordinates = [
	// 	// 			35.18052176446312, 32.90355133964454,
	// 	// 			35.181182279987446, 32.904230252434644,
	// 	// 			35.18168694163433, 32.903859142513156,
	// 	// 			35.18101835900742, 32.90319332771988
	// 	// 		];
	// 	//
	// 	// 		const building6Coordinates = [
	// 	// 			35.18108043776723, 32.90314966772901,
	// 	// 			35.18163484614006, 32.903695417559284,
	// 	// 			35.18210986622563, 32.903357052630284,
	// 	// 			35.181555475619945, 32.902815668798794
	// 	// 		];
	// 	//
	// 	// 		const building7Coordinates = [
	// 	// 			35.18019883243176, 32.90201887406947,
	// 	// 			35.18105481508689, 32.90283968181329,
	// 	// 			35.18139490374881, 32.902601734862955,
	// 	// 			35.18143841689294, 32.90265194384766,
	// 	// 			35.181570570446574, 32.90253406187378,
	// 	// 			35.18070090276381, 32.90167614314049
	// 	// 		];
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in longitude and latitude',
	// 	// 			polygon: {
	// 	// 				hierarchy: Cesium.Cartesian3.fromDegreesArray(building5Coordinates),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.PURPLE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in longitude and latitude',
	// 	// 			polygon: {
	// 	// 				hierarchy: Cesium.Cartesian3.fromDegreesArray(building6Coordinates),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.PURPLE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		viewer.entities.add({
	// 	// 			name: 'annotation with points given in longitude and latitude',
	// 	// 			polygon: {
	// 	// 				hierarchy: Cesium.Cartesian3.fromDegreesArray(building7Coordinates),
	// 	// 				material: new Cesium.ColorMaterialProperty(Cesium.Color.PURPLE.withAlpha(0.3))
	// 	// 			}
	// 	// 		});
	// 	//
	// 	// 		viewer.zoomTo(imageBoundsRectangle);
	// 	//
	// 	// 		// Sandcastle.addToolbarButton('Show/Hide entities', function() {
	// 	// 		// 	viewer.entities.show = !viewer.entities.show;
	// 	// 		// });
	// 	// 		//
	// 	// 		// Sandcastle.addToolbarButton('Show/Hide global imagery', function() {
	// 	// 		// 	baseImageryLayer.alpha = baseImageryLayer.alpha === 0.0 ? 1.0 : 0.0;
	// 	// 		// });
	// 	// 		//
	// 	// 		// Sandcastle.addToolbarButton('Reset View', function() {
	// 	// 		// 	viewer.zoomTo(imageBoundsRectangle);
	// 	// 		// 	viewer.entities.show = true;
	// 	// 		// 	baseImageryLayer.alpha = 0.0;
	// 	// 		// });
	// 	// 		this.mapObject = viewer;
	// 	// 		return new CesiumLayer(layer);
	// 	// 	})
	// 	// )
	// 	//
	// 	// function pixelSpaceToCartesianSpace(array, pixelProjection) {
	// 	// 	const pointsLength = array.length * 0.5;
	// 	// 	const cartesians = [];
	// 	//
	// 	// 	for (let i = 0; i < pointsLength; i++) {
	// 	// 		const pixelPoint = new Cesium.Cartesian3(array[i * 2], -array[i * 2 + 1]);
	// 	// 		const cartographic = pixelProjection.unproject(pixelPoint);
	// 	// 		const cartesian = pixelProjection.ellipsoid.cartographicToCartesian(cartographic);
	// 	// 		cartesians.push(cartesian);
	// 	// 	}
	// 	// 	return cartesians;
	// 	// }
	// }

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
			this.internallDestroyCesium();
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
		this.internallDestroyCesium();
	}

	internallDestroyCesium() {
		if (this.mapObject) {
			this.mapObject.camera.moveEnd.removeEventListener(this._moveEndListener);
			this.mapObject.destroy();
		}
	}

}
