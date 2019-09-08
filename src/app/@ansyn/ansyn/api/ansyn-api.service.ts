import { EventEmitter, Inject, Injectable, NgModuleRef } from '@angular/core';
import { ImageryCommunicatorService, ImageryMapPosition, IMapSettings } from '@ansyn/imagery';
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
import { FeatureCollection, Point, Polygon } from 'geojson';
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
	HideMeasurePanel,
	SetActiveCenter,
	ToolsActionsTypes
} from '../modules/menu-items/tools/actions/tools.actions';
import {
	DisplayOverlayAction,
	LoadOverlaysSuccessAction,
	SetOverlaysCriteriaAction
} from '../modules/overlays/actions/overlays.actions';
import { IOverlay, IOverlaysCriteria } from '../modules/overlays/models/overlay.model';
import { ANSYN_ID } from './ansyn-id.provider';
import { selectFilteredOveralys, selectOverlaysArray } from '../modules/overlays/reducers/overlays.reducer';
import { ToggleMenuCollapse } from '@ansyn/menu';
import { UUID } from 'angular2-uuid';
import { DataLayersService } from '../modules/menu-items/layers-manager/services/data-layers.service';

@Injectable({
	providedIn: 'root'
})
@AutoSubscriptions({
	init: 'init',
	destroy: 'destroy'
})
export class AnsynApi {
	activeMapId;
	mapsList: IMapSettings[];
	mapsEntities;
	activeAnnotationLayer;
	onReady = new EventEmitter<boolean>(true);

	@AutoSubscription
	activateMap$: Observable<string> = this.store.select(selectActiveMapId).pipe(
		tap((activeMapId) => this.activeMapId = activeMapId)
	);

	@AutoSubscription
	maps$: Observable<IMapSettings[]> = this.store.pipe(
		select(selectMapsList),
		tap((mapsList) => this.mapsList = mapsList)
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
			})
		);

	@AutoSubscription
	ready$ = this.imageryCommunicatorService.instanceCreated.pipe(
		take(1),
		tap((map) => this.onReady.emit(true))
	);

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

	setOutSourceMouseShadow(coordinates): void {
		this.store.dispatch(new ShadowMouseProducer({ point: { coordinates, type: 'point' }, outsideSource: true }));
	}

	// displayOverLay(overlay: IOverlay): void {
	// 	this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	// }

	displayOverLay(overlay: IOverlay, mapNumber: number = -1): void {
		let mapId = this.activeMapId;
		if (mapNumber >= 0 && mapNumber < this.mapsList.length) {
			mapId = this.mapsList[mapNumber].id;
		}
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: mapId, forceFirstDisplay: true }));
	}

	setAnnotations(featureCollection: FeatureCollection<any>): void {
		this.store.dispatch(new UpdateLayer(<ILayer>{
			...this.activeAnnotationLayer,
			data: cloneDeep(featureCollection)
		}));
	}

	deleteAllAnnotations(): void {
		this.setAnnotations(<FeatureCollection>(featureCollection([])));
	}

	setOverlays(overlays: IOverlay[]): void {
		this.store.dispatch(new LoadOverlaysSuccessAction(overlays, true));
	}

	changeMapLayout(layout: LayoutKey): Observable<any> {
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

	// todo:  change Array<number> to geojson.Point
	goToPosition(position: Array<number>): void {
		this.store.dispatch(new GoToAction(position));
	}

	setMapPositionByRect(rect: Polygon) {
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
	setRotation(degree: number, mapId?: string) {
		this.imageryCommunicatorService.provide(mapId ? mapId : this.activeMapId).setRotation(degree);
	}

	setMapPositionByRadius(center: Point, radiusInMeters: number, search: boolean = false) {
		this.store.dispatch(new SetMapPositionByRadiusAction({ id: this.activeMapId, center, radiusInMeters }));
		if (search) {
			const criteria: IOverlaysCriteria = {
				region: center
			};
			this.store.dispatch(new SetOverlaysCriteriaAction(criteria));
		}
	}

	setOverlaysCriteria(criteria: IOverlaysCriteria) {
		this.store.dispatch(new SetOverlaysCriteriaAction(criteria));
	}

	getOverlayData(mapId: string = this.activeMapId) {
		return this.mapsEntities[mapId].data.overlay;
	}

	collapseFooter(collapse: boolean) {
		this.store.dispatch(new ToggleFooter(collapse));
	}

	collapseMenu(collapse: boolean) {
		this.store.dispatch(new ToggleMenuCollapse(collapse));
	}

	hideMeasurePanel(collapse: boolean) {
		this.store.dispatch(new HideMeasurePanel(collapse));
	}

	insertLayer(layerName: string, layerData: FeatureCollection<any>): string {
		if (!Boolean(layerData)) {
			console.error('failed to add layer ', layerName, ' feature collection is undefined');
			return null;
		}

		this.generateFeaturesIds(layerData);
		const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData);
		this.store.dispatch(new AddLayer(layer));
		return layer.id;
	}

	removeLayer(layerId: string): void {
		if (!(layerId && layerId.length)) {
			console.error('failed to remove layer - invalid layerId ', layerId);
			return;
		}
		this.store.dispatch(new RemoveLayer(layerId));
	}

	showLayer(layerId: string, show: boolean): void {
		if (!(layerId && layerId.length)) {
			console.error('failed to show layer - invalid layerId ', layerId);
			return;
		}
		this.store.dispatch(new SetLayerSelection({ id: layerId, value: show }));
	}

	private generateFeaturesIds(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			feature.properties = { ...feature.properties, id: UUID.UUID() };
		});

	}

	init(): void {
	}

	destroy(): void {
		this.moduleRef.destroy();
		this.removeElement(this.id);
	}
}
