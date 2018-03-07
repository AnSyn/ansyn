import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CaseMapExtent, CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

export abstract class IMap<T = any> {
	centerChanged: EventEmitter<GeoJSON.Point>;
	positionChanged: EventEmitter<CaseMapPosition>;
	pointerMove: EventEmitter<any>;
	singleClick: EventEmitter<any>;
	contextMenu: EventEmitter<any>;
	mapType: string;
	mapObject: T;
	projectionService: ProjectionService;

	static addGroupLayer(layer: any, groupName: string) {
	}

	static removeGroupLayer(layer: any, groupName: string) {
	}

	static addGroupVectorLayer(layer: any, groupName: string) {
	}

	abstract getCenter(): GeoJSON.Point;

	abstract setCenter(center: GeoJSON.Point, animation: boolean);

	abstract toggleGroup(groupName: string);

	/**
	 * @description Reset the Map view with a new view with the new layer projection (NOTE: also Delete's previous layers)
	 * @param {any} layer The new layer to set the view with. this layer projection will be the views projection
	 * @param {GeoJSON.Point[]} extent The extent (bounding box points) of the map at ESPG:4326
	 */
	abstract resetView(layer: any, position: CaseMapPosition, extent?: CaseMapExtent): void;

	abstract addLayer(layer: any): void;

	abstract removeLayer(layer: any): void;

	abstract setPosition(position: CaseMapPosition): void;

	abstract setRotation(rotation: number): void;

	abstract getRotation(): number;

	abstract getPosition(): CaseMapPosition;

	abstract updateSize(): void;

	abstract addGeojsonLayer(data: GeoJSON.GeoJsonObject);

	abstract setAutoImageProcessing(shouldPerform: boolean): void;

	abstract setManualImageProcessing(processingParams: Object): void;

	abstract dispose(): void;

	abstract setPointerMove(enable: boolean);

	abstract getPointerMove(): Observable<any>;

	abstract addSingleClickEvent();

	abstract removeSingleClickEvent();

	abstract addLayerIfNotExist(layer: any);
}
