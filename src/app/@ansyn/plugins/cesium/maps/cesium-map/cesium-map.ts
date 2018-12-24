import { GeoJsonObject, Point } from 'geojson';
import { Observable, of, throwError } from 'rxjs';
import { ICaseMapPosition } from '@ansyn/core';
import { BaseImageryMap, ImageryMap } from '@ansyn/imagery';

Cesium.buildModuleUrl.setBaseUrl('assets/Cesium/');
Cesium.BingMapsApi.defaultKey = 'AnjT_wAj_juA_MsD8NhcEAVSjCYpV-e50lUypkWm1JPxVu0XyVqabsvD3r2DQpX-';

export const CesiumMapName = 'cesium';

// @dynamic
@ImageryMap({
	mapType: CesiumMapName
})
export class CesiumMap extends BaseImageryMap<any> {
	static groupLayers = new Map<string, any>();
	mapObject: any;


	initMap(element: HTMLElement, shadowElement: HTMLElement, layers: any, position?: ICaseMapPosition): Observable<boolean> {
		this.mapObject = new Cesium.Viewer(element, {
			imageryProvider: layers[0]
		});

		if (position) {
			const rec = [...position.extentPolygon.coordinates[0][0], ...position.extentPolygon.coordinates[0][2]];
			this.mapObject.camera.setView({
				destination: Cesium.Rectangle.fromDegrees(...rec)
			});
		}
		return of(true);
	}

	getCenter(): Observable<Point> {
		return throwError(new Error('Method not implemented.'));
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return throwError(new Error('Method not implemented.'));
	}

	toggleGroup(groupName: string, newState: boolean) {
		throw new Error('Method not implemented.');
	}


	resetView(layer: any): Observable<boolean> {
		const layers = this.mapObject.imageryLayers;
		const baseLayer = layers.get(0);
		layers.remove(baseLayer);
		layers.addImageryProvider(layer);
		return of(true);
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(position: ICaseMapPosition): Observable<boolean> {
		return throwError(new Error('Method not implemented.'));
	}

	getPosition(): Observable<ICaseMapPosition> {
		return throwError(new Error('Method not implemented.'));
	}

	setRotation(rotation: number): void {
		throw new Error('Method not implemented.');
	}

	updateSize(): void {
		console.log('Update size cesium')
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

	dispose() {
	}

}
