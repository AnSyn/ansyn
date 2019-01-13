import { GeoJsonObject, Point, Polygon } from 'geojson';
import { Observable, of, throwError } from 'rxjs';
import { CaseMapExtent, ExtentCalculator, CoreConfig, ICaseMapPosition, ICoreConfig, toDegrees } from '@ansyn/core';
import { BaseImageryMap, ImageryMap } from '@ansyn/imagery';
import { Inject } from '@angular/core';
import { feature, geometry } from '@turf/turf';
import { featureCollection } from '@turf/helpers';
import { map, take } from 'rxjs/operators';
import { CesiumProjectionService } from '../../projection/cesium-projection.service';
import * as turf from '@turf/turf';
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
	_moveEndListener;
	element: any;
	constructor(public projectionService: CesiumProjectionService, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
		super();
	}

	initMap(element: HTMLElement, shadowElement: HTMLElement, layers: any, position?: ICaseMapPosition): Observable<boolean> {
		this.element = element;
		this.mapObject = new Cesium.Viewer(element);

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
					destination : Cesium.Cartesian3.fromDegrees(geoJsonCenter[0], geoJsonCenter[1], currentPosition.height)
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


	resetView(layer: any, position: ICaseMapPosition, extent?: CaseMapExtent): Observable<boolean> {
		const imageryLayers = this.mapObject.imageryLayers;
		imageryLayers.removeAll(false);
		imageryLayers.addImageryProvider(layer);
		if (extent) {
			return this.fitToExtent(extent);
		}
		return this.setPosition(position);
	}

	fitToExtent(extent: CaseMapExtent) {
		const collection: any = turf.featureCollection([]);
		return this.internalSetPosition((<any>ExtentCalculator.extentToPolygon(extent)).geometry);
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
		const { height, width } = this.mapObject.canvas;
		try {
			const topLeft = this._imageToGround({ x: 0, y: 0 });
			const topRight = this._imageToGround({ x: width, y: 0 });
			const bottomRight = this._imageToGround({ x: width, y: height });
			const bottomLeft = this._imageToGround({ x: 0, y: height });
			const extentPolygon = <Polygon> geometry('Polygon', [[topLeft, topRight, bottomRight, bottomLeft, topLeft]]);
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

		if (this.mapObject) {
			this.mapObject.camera.moveEnd.removeEventListener(this._moveEndListener);
		}
	}

}
