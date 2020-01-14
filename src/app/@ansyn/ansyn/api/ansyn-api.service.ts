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
import { selectFilteredOveralys, selectOverlaysArray } from '../modules/overlays/reducers/overlays.reducer';
import { ToggleMenuCollapse } from '@ansyn/menu';
import { UUID } from 'angular2-uuid';
import { DataLayersService } from '../modules/menu-items/layers-manager/services/data-layers.service';
import { SetMinimalistViewModeAction } from '@ansyn/map-facade';

@Injectable({
	providedIn: 'root'
})
@AutoSubscriptions({
	init: 'init',
	destroy: 'destroy'
})
export class AnsynApi {
	activeMapId;
	mapsEntities;
	activeAnnotationLayer;
	defaultLayerId: string;
	events = {
		onReady: new EventEmitter<boolean>(),
		overlaysLoadedSuccess: new EventEmitter<IOverlay[] | false>(),
		displayOverlaySuccess: new EventEmitter<{overlay: IOverlay | false, mapId: string}>()
	};
	/** @deprecated onReady as own events was deprecated use events.onReady instead */
	onReady = new EventEmitter<boolean>(true);

	getMaps$: Observable<IMapSettings[]> = this.store.pipe(
		select(selectMapsList),
		take(1)
	);

	@AutoSubscription
	activateMap$: Observable<string> = this.store.select(selectActiveMapId).pipe(
		tap((activeMapId) => this.activeMapId = activeMapId)
	);

	@AutoSubscription
	mapsEntities$: Observable<Dictionary<IMapSettings>> = this.store.pipe(
		select(selectMaps),
		tap((mapsEntities) => this.mapsEntities = mapsEntities)
	);

	@AutoSubscription
	activeAnnotationLayer$: Observable<ILayer> = this.store
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
	ready$ = this.imageryCommunicatorService.instanceCreated.pipe(
		take(1),
		tap((map) => {
			this.onReady.emit(true);
			this.events.onReady.emit(true);
		})
	);

	@AutoSubscription
	overlaysSearchEnd$ = this.actions$.pipe(
		ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		tap(({ payload }) => {
			this.events.overlaysLoadedSuccess.emit(payload.length > 0 ? payload : false);
		})
	);

	@AutoSubscription
	displayOverlaySuccess$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		tap(({ payload }) => this.events.displayOverlaySuccess.emit({
			overlay: payload.overlay,
			mapId: payload.mapId
		}))
	);

	@AutoSubscription
	displayOverlayFailed$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED),
		tap(({ payload }) => this.events.displayOverlaySuccess.emit({
			overlay: false,
			mapId: payload.mapId
		}))
	);

	/** Events **/

	onShadowMouseProduce$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SHADOW_MOUSE_PRODUCER),
		map(({ payload }: ShadowMouseProducer) => {
			return payload.point.coordinates;
		})
	);

	onSetLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT_SUCCESS)
	);

	getActiveCenter$: Observable<any> = this.actions$.pipe(
		ofType(ToolsActionsTypes.SET_ACTIVE_CENTER),
		map(({ payload }: SetActiveCenter) => {
			return payload;
		})
	);

	constructor(private store: Store<any>,
				protected actions$: Actions,
				protected projectionConverterService: ProjectionConverterService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected moduleRef: NgModuleRef<any>,
				private dataLayersService: DataLayersService,
				@Inject(ANSYN_ID) public id: string) {
		this.init();
	}

	removeElement(id): void {
		const elem: HTMLElement = <any>document.getElementById(id);
		if (elem) {
			elem.innerHTML = '';
		}
	}

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

	// displayOverLay(overlay: IOverlay): void {
	// 	this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	// }

	displayOverLay(overlay: IOverlay, mapNumber: number = -1): void {
		if (!Boolean(overlay)) {
			console.error('can\'t display undefined overlay');
			return null;
		}
		this.getMaps$.subscribe((mapsList: IMapSettings[]) => {
			let mapId = this.activeMapId;
			if (mapNumber >= 0 && mapNumber < mapsList.length) {
				mapId = mapsList[mapNumber].id;
			}
			this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: mapId, forceFirstDisplay: true }));
		});
	}

	setAnnotations(featureCollection: FeatureCollection<any>): void {
		if (!Boolean(featureCollection)) {
			console.error('can\'t set undefined annotations');
			return null;
		}
		if (featureCollection.type !== 'FeatureCollection') {
			console.error('feature collection must have FeatureCollection type');
			return null;
		}
		this.store.dispatch(UpdateLayer({layer: {
									...this.activeAnnotationLayer,
									data: cloneDeep(featureCollection)
								}
		}));
	}

	deleteAllAnnotations(): void {
		this.setAnnotations(<FeatureCollection>(featureCollection([])));
	}

	setOverlays(overlays: IOverlay[]): void {
		if (!Boolean(overlays)) {
			console.error('can\'t set undefined overlays');
			return null;
		}
		this.store.dispatch(new LoadOverlaysSuccessAction(overlays, true));
	}

	changeMapLayout(layout: LayoutKey): Observable<any> {
		if (!Boolean(layout)) {
			console.error('can\'t change layout to undefined');
			return null;
		}
		this.store.dispatch(new SetLayoutAction(layout));
		return this.onSetLayoutSuccess$;
	}

	transfromHelper(position, convertMethodFrom: ICoordinatesSystem, convertMethodTo: ICoordinatesSystem): void {
		const conversionValid = this.projectionConverterService.isValidConversion(position, convertMethodFrom);
		if (conversionValid) {
			this.projectionConverterService.convertByProjectionDatum(position, convertMethodFrom, convertMethodTo);
		}
	}

	getMapPosition(): ImageryMapPosition {
		return this.mapsEntities[this.activeMapId].data.position;
	}

	goToPosition(geoPoint: Point): void {
		if (!Boolean(geoPoint)) {
			console.error('can\'t go to undefined point');
			return null;
		}
		this.store.dispatch(new GoToAction(geoPoint.coordinates));
	}

	setMapPositionByRect(rect: Polygon) {
		if (!Boolean(rect)) {
			console.error('can\'t set position to undefined rect');
			return null;
		}
		this.store.dispatch(new SetMapPositionByRectAction({ id: this.activeMapId, rect }));
	}

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
	 * @param degree
	 * @param mapId
	 */
	setRotation(degree: number, mapId: string = this.activeMapId) {
		if (!Boolean(degree)) {
			console.error('can\'t rotate to undefined degree');
			return null;
		}
		this.imageryCommunicatorService.provide(mapId).setRotation(degree);
	}

	setMapPositionByRadius(center: Point, radiusInMeters: number, search: boolean = false) {
		if (!Boolean(center)) {
			console.error('can\'t set position to undefined point');
			return null;
		}
		this.store.dispatch(new SetMapPositionByRadiusAction({ id: this.activeMapId, center, radiusInMeters }));
		if (search) {
			const criteria: IOverlaysCriteria = {
				region: center
			};
			this.store.dispatch(new SetOverlaysCriteriaAction(criteria));
		}
	}

	setOverlaysCriteria(criteria: IOverlaysCriteria, radiusInMetersBuffer ?: number) {
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

	getOverlayData(mapId: string = this.activeMapId): IOverlay {
		return this.mapsEntities[mapId].data.overlay;
	}

	collapseFooter(collapse: boolean) {
		this.store.dispatch(new ToggleFooter(collapse));
	}

	collapseMenu(collapse: boolean) {
		this.store.dispatch(new ToggleMenuCollapse(collapse));
	}

	setMinimalistViewMode(collapse: boolean) {
		this.collapseFooter(collapse);
		this.collapseMenu(collapse);
		this.store.dispatch(new SetMinimalistViewModeAction(collapse));
	}

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
			feature.properties.label = label && typeof label === 'object' ? label : {text: label, geometry: null};
		});

		this.generateFeaturesIds(layerData);
		const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData, !isEditable);
		this.store.dispatch(AddLayer({layer}));
		return layer.id;
	}

	removeLayer(layerId: string): void {
		if (!(layerId && layerId.length)) {
			console.error('failed to remove layer - invalid layerId ', layerId);
			return;
		}
		this.store.dispatch(RemoveLayer({layerId}));
	}

	showLayer(layerId: string, show: boolean): void {
		if (!(layerId && layerId.length)) {
			console.error('failed to show layer - invalid layerId ', layerId);
			return;
		}
		this.store.dispatch(SetLayerSelection({ id: layerId, value: show }));
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
			feature.properties = { ...feature.properties, id: UUID.UUID() };
		});

	}
}
