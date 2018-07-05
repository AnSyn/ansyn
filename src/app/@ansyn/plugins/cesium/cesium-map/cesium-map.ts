import { GeoJsonObject, Point } from 'geojson';
import { Observable } from 'rxjs';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ImageryMap } from '@ansyn/imagery/model/decorators/imagery-map';
import { BaseImageryMap } from '@ansyn/imagery/model/base-imagery-map';
export const CesiumMapName = 'cesium';

@ImageryMap({
	mapType: CesiumMapName
})
export class CesiumMap extends BaseImageryMap<any> {
	static groupLayers = new Map<string, any>();
	mapObject: any;

	initMap(element: HTMLElement, layers: any, position?: CaseMapPosition): Observable<boolean> {
		this.mapObject = {};
		return Observable.of(false);
	}

	getCenter(): Observable<Point> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	setCenter(center: Point, animation: boolean): Observable<boolean> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	toggleGroup(groupName: string, newState: boolean) {
		throw new Error('Method not implemented.');
	}

	resetView(layer: any): Observable<boolean> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	addLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	removeLayer(layer: any): void {
		throw new Error('Method not implemented.');
	}

	setPosition(position: CaseMapPosition): Observable<boolean> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	getPosition(): Observable<CaseMapPosition> {
		return Observable.throw(new Error('Method not implemented.'));
	}

	setRotation(rotation: number): void {
		throw new Error('Method not implemented.');
	}

	updateSize(): void {
		throw new Error('Method not implemented.');
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
