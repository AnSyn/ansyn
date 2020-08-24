import { EventEmitter, Inject, Injectable, NgModuleRef } from '@angular/core';
import {
	getPolygonByPointAndRadius,
	getPolygonByBufferRadius,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapSettings
} from '@ansyn/imagery';
import {
	ICoordinatesSystem,
	LayoutKey,
	MapActionTypes,
	ProjectionConverterService,
	selectActiveMapId,
	selectMaps,
	selectMapsList,
	SetLayoutAction,
	SetMapPositionByRadiusAction,
	SetMapPositionByRectAction,
	ShadowMouseProducer,
	ToggleFooter
} from '@ansyn/map-facade';
import { Actions, ofType } from '@ngrx/effects';
import { Dictionary } from '@ngrx/entity/src/models';
import { select, Store } from '@ngrx/store';
import { featureCollection } from '@turf/turf';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { cloneDeep } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { map, take, tap, withLatestFrom } from 'rxjs/operators';
import {
	AddLayer,
	RemoveLayer,
	SetLayerSelection,
	UpdateLayer
} from '../modules/menu-items/layers-manager/actions/layers.actions';
import { ILayer } from '../modules/menu-items/layers-manager/models/layers.model';
import {
	selectActiveAnnotationLayer,
	selectLayersEntities
} from '../modules/menu-items/layers-manager/reducers/layers.reducer';
import {
	GoToAction,
	SetActiveCenter,
	ToolsActionsTypes
} from '../modules/menu-items/tools/actions/tools.actions';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	SetOverlaysCriteriaAction
} from '../modules/overlays/actions/overlays.actions';
import { IOverlay, IOverlaysCriteria } from '../modules/overlays/models/overlay.model';
import { ANSYN_ID } from './ansyn-id.provider';
import {
	selectFilteredOveralys,
	selectOverlaysArray,
	selectOverlaysCriteria
} from '../modules/overlays/reducers/overlays.reducer';
import { ToggleMenuCollapse } from '@ansyn/menu';
import { UUID } from 'angular2-uuid';
import { DataLayersService } from '../modules/menu-items/layers-manager/services/data-layers.service';
import { SetMinimalistViewModeAction } from '@ansyn/map-facade';
import { AnnotationsVisualizer } from "@ansyn/ol";

type mapIdOrNumber = string | number | undefined;
@Injectable({
	providedIn: 'root'
})
@AutoSubscriptions({
	init: 'init',
	destroy: 'destroy'
})
/**
 * a api for manipulating on the ansyn app.
 */
export class AnsynApi {
	private mapList;
	private features = [];
	/**
	 * the id of the active map.
	 * @var {string}
	 */
	activeMapId;
	/**
	 * key-value from the map id to the map itself.
	 * @var {Dictionary<IMapSettings>}
	 */
	mapsEntities;
	/**
	 * the active annotation layer
	 * @var {ILayer}
	 */
	activeAnnotationLayer;
	/**
	 * the id of the default layer.
	 * @var {string}.
	 */
	defaultLayerId: string;
	events = {
		/**
		 * fire when the app is ready(map was loaded)
		 */
		onReady: new EventEmitter<boolean>(),
		/**
		 * fire when the timeline was load with overlays.
		 * @property {IOverlay[] | false} overlays - array of the loaded overlays or false if there was error.
		 */
		overlaysLoadedSuccess: new EventEmitter<IOverlay[] | false>(),
		/**
		 * fire when an overlay was loaded to the map
		 * @property {IOverlay | false} the loaded overlay or false if there was error on open the overlay.
		 * @property {string} mapId - the id of the map.
		 */
		displayOverlaySuccess: new EventEmitter<{ overlay: IOverlay | false, mapId: string }>()
	};
	/** @deprecated onReady as own events was deprecated use events.onReady instead */
	onReady = new EventEmitter<boolean>(true);

	/**
	 * @return {Observable} An observable that emits the maps in array.
	 */
	getMaps$: Observable<IMapSettings[]> = this.store.pipe(
		select(selectMapsList),
		take(1)
	);

	@AutoSubscription
	private activateMap$: Observable<string> = this.store.select(selectActiveMapId).pipe(
		tap((activeMapId) => this.activeMapId = activeMapId)
	);

	@AutoSubscription
	private mapsEntities$: Observable<Dictionary<IMapSettings>> = this.store.pipe(
		select(selectMaps),
		tap((mapsEntities) => this.mapsEntities = mapsEntities)
	);

	@AutoSubscription
	private mapList$ = this.store.pipe(
		select(selectMapsList),
		tap( (mapList) => this.mapList = mapList)
	);

	@AutoSubscription
	private activeAnnotationLayer$: Observable<ILayer> = this.store
		.pipe(
			select(selectActiveAnnotationLayer),
			withLatestFrom(this.store.select(selectLayersEntities)),
			map(([activeAnnotationLayerId, entities]) => entities[activeAnnotationLayerId]),
			tap((activeAnnotationLayer) => {
				this.activeAnnotationLayer = activeAnnotationLayer;
				this.defaultLayerId = this.activeAnnotationLayer ? this.activeAnnotationLayer.id : undefined;
			})
		);


	/** Events **/
	@AutoSubscription
	private ready$ = this.imageryCommunicatorService.instanceCreated.pipe(
		take(1),
		tap((map) => {
			this.onReady.emit(true);
			this.events.onReady.emit(true);
		})
	);

	@AutoSubscription
	private overlaysSearchEnd$ = this.actions$.pipe(
		ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		tap(({ payload }) => {
			this.events.overlaysLoadedSuccess.emit(payload.length > 0 ? payload : false);
		})
	);

	@AutoSubscription
	private displayOverlaySuccess$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		tap(({ payload }) => this.events.displayOverlaySuccess.emit({
			overlay: payload.overlay,
			mapId: payload.mapId
		}))
	);

	@AutoSubscription
	private displayOverlayFailed$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED),
		tap(({ payload }) => this.events.displayOverlaySuccess.emit({
			overlay: false,
			mapId: payload.mapId
		}))
	);

	/** Events end **/

	/**
	 * @return {Observable} an observable that emit the current mouse position on the map.
	 */
	onShadowMouseProduce$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SHADOW_MOUSE_PRODUCER),
		map(({ payload }: ShadowMouseProducer) => {
			return payload.point.coordinates;
		})
	);
	/**
	 * @return {Observable} An observable that emit when the map layout is change
	 */
	onSetLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT_SUCCESS)
	);

	/**
	 * @return {Observable} An observable that emit when the center of the map is change
	 * from the search box or the go-to tool
	 */
	getActiveCenter$: Observable<any> = this.actions$.pipe(
		ofType(ToolsActionsTypes.SET_ACTIVE_CENTER),
		map(({ payload }: SetActiveCenter) => {
			return payload;
		})
	);

	constructor(protected store: Store<any>,
				protected actions$: Actions,
				protected projectionConverterService: ProjectionConverterService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected moduleRef: NgModuleRef<any>,
				private dataLayersService: DataLayersService,
				@Inject(ANSYN_ID) public id: string) {
		this.init();
	}

	private getMapIdFromMapNumber(mapId: mapIdOrNumber): string {
		if (!Boolean(mapId)) {
			return this.activeMapId;
		}
		if (typeof mapId === 'string') {
			return mapId;
		}
		return (mapId < 0 || mapId >= 4) && this.mapList[mapId - 1] ? this.mapList[mapId - 1].id : this.activeMapId;
	}

	private removeElement(id): void {
		const elem: HTMLElement = <any>document.getElementById(id);
		if (elem) {
			elem.innerHTML = '';
		}
	}

	/**
	 * draw the shadow mouse visualizer in the specific point
	 * @param {Point} geoPoint The point where we will draw the visualizer.
	 */
	setOutSourceMouseShadow(geoPoint: Point): void {
		if (!Boolean(geoPoint)) {
			console.error('can\'t set undefined point to shadow mouse');
			return null;
		}
		this.store.dispatch(new ShadowMouseProducer({
			point: { coordinates: geoPoint.coordinates, type: 'point' },
			outsideSource: true
		}));
	}

	/**
	 * open an overlay on the map
	 * @param {IOverlay} overlay the overlay will be display
	 * @param {mapIdOrNumber} mapId the map number or id. default the active map id.
	 */
	displayOverLay(overlay: IOverlay, mapId?: mapIdOrNumber): void {
		if (!Boolean(overlay)) {
			console.error('can\'t display undefined overlay');
			return null;
		}
		this.store.dispatch(new DisplayOverlayAction({ overlay,
			mapId: this.getMapIdFromMapNumber(mapId),
			forceFirstDisplay: true }));
	}

	/**
	 * draw the feature collection on the map.
	 * @param {FeatureCollection} featureCollection the features to draw on the map.
	 */
	setAnnotations(featureCollection: FeatureCollection<any>): void {
		if (!Boolean(featureCollection)) {
			console.error('can\'t set undefined annotations');
			return null;
		}
		if (featureCollection.type !== 'FeatureCollection') {
			console.error('feature collection must have FeatureCollection type');
			return null;
		}
		this.store.dispatch(new UpdateLayer(<ILayer>{
			...this.activeAnnotationLayer,
			data: cloneDeep(featureCollection)
		}));

		this.features = featureCollection.features;
	}

	/**
	 * delete all the features in the map
	 */
	deleteAllAnnotations(): void {
		const plugin: AnnotationsVisualizer = this.imageryCommunicatorService.communicatorsAsArray()[0].getPlugin(AnnotationsVisualizer);
		this.features.forEach(feature => plugin.setEditAnnotationMode(<string>feature.properties.id, false));
		this.setAnnotations(<FeatureCollection>(featureCollection([])));
	}

	/**
	 * feed the timeline with the given overlays
	 * @param {Array<IOverlay>>} overlays array of IOverlay to be load into the timeline
	 */
	setOverlays(overlays: IOverlay[]): void {
		if (!Boolean(overlays)) {
			console.error('can\'t set undefined overlays');
			return null;
		}
		this.store.dispatch(new LoadOverlaysSuccessAction(overlays, true));
	}

	/**
	 * change the application layout
	 * @param {LayoutKey} layout the new layout key.
	 * @return Observable that emit once the layout successfully change.
	 */
	changeMapLayout(layout: LayoutKey): Observable<any> {
		if (!Boolean(layout)) {
			console.error('can\'t change layout to undefined');
			return null;
		}
		this.store.dispatch(new SetLayoutAction(layout));
		return this.onSetLayoutSuccess$.pipe(take(1));
	}

	/**
	 * convert coordinate from one coordinate system to another
	 * @param {Array<number>} position the position in the old coordinate system
	 * @param {ICoordinatesSystem} convertFrom the current coordinate system of the position
	 * @param {ICoordinatesSystem} convertTo the new coordinate system to the position
	 * @return {Array<number>} the position in the new coordinate system.
	 */
	transfromHelper(position: number[], convertFrom: ICoordinatesSystem, convertTo: ICoordinatesSystem): void {
		const conversionValid = this.projectionConverterService.isValidConversion(position, convertFrom);
		if (conversionValid) {
			this.projectionConverterService.convertByProjectionDatum(position, convertFrom, convertTo);
		}
	}

	/**
	 * @param {mapIdOrNumber} mapId the map id or number, default the active map id.
	 * @return {ImageryMapPosition} the position of the map.
	 */
	getMapPosition(mapId: mapIdOrNumber): ImageryMapPosition {
		return this.mapsEntities[this.getMapIdFromMapNumber(mapId)].data.position;
	}

	/**
	 * set the center of the map to the given point
	 * @param {Point} geoPoint the new center for the map.
	 * @param {mapIdOrNumber} mapId the map id or number, default the active map id.
	 */
	goToPosition(geoPoint: Point, mapId?: mapIdOrNumber): void {
		if (!Boolean(geoPoint)) {
			console.error('can\'t go to undefined point');
			return null;
		}
		this.store.dispatch(new GoToAction(geoPoint.coordinates, this.getMapIdFromMapNumber(mapId)));
	}

	/**
	 * set the map extent to the given polygon
	 * @param {Polygon} rect a rectangle polygon
	 * @param {mapIdOrNumber} mapId the id of the map to be set. default the active map id.
	 */
	setMapPositionByRect(rect: Polygon, mapId?: mapIdOrNumber) {
		if (!Boolean(rect)) {
			console.error('can\'t set position to undefined rect');
			return null;
		}
		this.store.dispatch(new SetMapPositionByRectAction({ id: this.getMapIdFromMapNumber(mapId), rect }));
	}

	/**
	 * @return {Array<IOverlay>}all the overlays in the timeline.
	 */
	getOverlays(): Observable<IOverlay[]> {
		return combineLatest(this.store.select(selectOverlaysArray), this.store.select(selectFilteredOveralys)).pipe(
			take(1),
			map(([overlays, filteredOverlays]: [IOverlay[], string[]]) => {
				return overlays.filter((overlay) => {
					return filteredOverlays.includes(overlay.id);
				});
			})
		);
	}

	/**
	 * rotate the map by degree. if it is not geo registered image rotate the image.
	 * @param {number} radian The rotation of the map in radians.
	 * @param {mapIdOrNumber} mapId the id of the map. default to the active map.
	 */
	setRotation(radian: number, mapId?: mapIdOrNumber) {
		if (radian === undefined) {
			console.error('can\'t rotate to undefined degree');
			return null;
		}
		this.imageryCommunicatorService.provide(this.getMapIdFromMapNumber(mapId)).setRotation(radian);
	}

	/**
	 * get the current rotation of the map.
	 * @param {mapIdOrNumber} mapId the id of the map. default to the active map.
	 */
	getRotation(mapId?: mapIdOrNumber) {
		return this.imageryCommunicatorService.provide(this.getMapIdFromMapNumber(mapId)).getRotation();
	}

	/**
	 * set the map center to the specific point and scale the map to the radius
	 * @param {Point} center GeoJSON point to be set the map to.
	 * @param {number} radiusInMeters set the map scale to radiusInMeters / 10
	 * @param {mapIdOrNumber} mapId the id of the map to be set. default the active map id.
	 * @param {boolean} search does make new search in the new position or not.
	 */
	setMapPositionByRadius(center: Point, radiusInMeters: number, mapId: mapIdOrNumber, search: boolean = false) {
		if (!Boolean(center)) {
			console.error('can\'t set position to undefined point');
			return null;
		}
		this.store.dispatch(new SetMapPositionByRadiusAction({ id: this.getMapIdFromMapNumber(mapId), center, radiusInMeters }));
		if (search) {
			const criteria: IOverlaysCriteria = {
				region: center
			};
			this.store.dispatch(new SetOverlaysCriteriaAction(criteria));
		}
	}

	/**
	 * make a new search with the specific criteria
	 * @param {IOverlaysCriteria} criteria of the search. you can pass only one criterion.
	 * @param {number} [radiusInMetersBuffer] if the region criterion is provide, bump the region by the radius.
	 */
	setOverlaysCriteria(criteria: IOverlaysCriteria, radiusInMetersBuffer?: number) {
		if (!Boolean(criteria)) {
			console.error('failed to set overlays criteria to undefined');
			return null;
		}
		if (Boolean(criteria.region) && (radiusInMetersBuffer !== undefined && radiusInMetersBuffer !== 0)) {
			switch (criteria.region.type.toLowerCase()) {
				case 'point':
					const polygonByPointAndRadius: Feature<Polygon> = getPolygonByPointAndRadius(criteria.region.coordinates, radiusInMetersBuffer / 1000);
					criteria.region = polygonByPointAndRadius.geometry;
					break;
				case 'polygon':
					criteria.region = getPolygonByBufferRadius(criteria.region, radiusInMetersBuffer).geometry;
					break;
				default:
					console.error('not supported type: ' + criteria.region.type);
					return null;
			}
		}
		this.store.dispatch(new SetOverlaysCriteriaAction(criteria));
	}

	/**
	 * @return {Observable} An Observable that emits when the search criteria was change.
	 */
	getOverlaysCriteria(): Observable<IOverlaysCriteria> {
		return this.store.select(selectOverlaysCriteria);
	}

	/**
	 * @return {IOverlay} the overlay that display on the map, or undefined if no overlay was display
	 * @param mapId the id of the map.
	 */
	getOverlayData(mapId?: mapIdOrNumber): IOverlay {
		return this.mapsEntities[this.getMapIdFromMapNumber(mapId)].data.overlay;
	}

	/**
	 * set if the footer(the timeline container) is minimize or maximize.
	 * @param {boolean} collapse true for minimize the footer, or false to maximize.
	 */
	collapseFooter(collapse: boolean) {
		this.store.dispatch(new ToggleFooter(collapse));
	}

	/**
	 * set if the menu is minimize or maximize.
	 * @param {boolean} collapse true for minimize the menu, or false to maximize.
	 */
	collapseMenu(collapse: boolean) {
		this.store.dispatch(new ToggleMenuCollapse(collapse));
	}

	/**
	 * set the app to minimalist view.
	 * minimalist view show only the map the compass and the name of the overlay(or Base map, if there is no overlay display)/
	 * @param {boolean} collapse true to set the app to minimalist view, false to set the app to normal view.
	 */
	setMinimalistViewMode(collapse: boolean) {
		this.collapseFooter(collapse);
		this.collapseMenu(collapse);
		this.store.dispatch(new SetMinimalistViewModeAction(collapse));
	}

	/**
	 * add new layer to the Data Layer
	 * @param {string}layerName the layer name.
	 * @param {FeatureCollection} layerData the features to be add into the layer.
	 * @param {boolean} isEditable set if this layer was editable or not. default true
	 * @return {string} the layer id. for future deletion of the layer.
	 */
	insertLayer(layerName: string, layerData: FeatureCollection<any>, isEditable: boolean = true): string {
		if (!(layerName && layerName.length)) {
			console.error('failed to add layer without a name', layerName);
			return null;
		}
		if (!Boolean(layerData)) {
			console.error('failed to add layer ', layerName, ' feature collection is undefined');
			return null;
		}

		layerData.features.forEach((feature) => {
			feature.properties.isNonEditable = !isEditable;
			const { label } = feature.properties;
			feature.properties.label = label && typeof label === 'object' ? label : { text: label, geometry: null };
		});

		this.generateFeaturesIds(layerData);
		const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData, !isEditable);
		this.store.dispatch(new AddLayer(layer));
		return layer.id;
	}

	/**
	 * remove the specific layer from the Data layer.
	 * @param {string} layerId the id of the layer who return from {inserLayer}
	 */
	removeLayer(layerId: string): void {
		if (!(layerId && layerId.length)) {
			console.error('failed to remove layer - invalid layerId ', layerId);
			return;
		}
		this.store.dispatch(new RemoveLayer(layerId));
	}

	/**
	 * set if the specific layer is show or hide.
	 * @param {string} layerId the id of the layer who return from {inserLayer}
	 * @param {boolean} show true to show the layer, false to hide.
	 */
	showLayer(layerId: string, show: boolean): void {
		if (!(layerId && layerId.length)) {
			console.error('failed to show layer - invalid layerId ', layerId);
			return;
		}
		this.store.dispatch(new SetLayerSelection({ id: layerId, value: show }));
	}

	init(): void {
	}

	destroy(): void {
		this.moduleRef.destroy();
		this.removeElement(this.id);
	}

	private generateFeaturesIds(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			feature.properties = { ...feature.properties, id: feature.id ? feature.id : UUID.UUID() };
		});

	}
}
