import { Inject, Injectable, NgModuleRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import {
	MapActionTypes,
	selectActiveMapId,
	selectMaps,
	selectMapsList,
	SetMapPositionByRadiusAction,
	SetMapPositionByRectAction,
	ShadowMouseProducer
} from '@ansyn/map-facade';
import { Observable } from 'rxjs';
import {
	GoToAction,
	ILayer,
	ProjectionConverterService,
	selectActiveAnnotationLayer,
	selectLayersEntities,
	SetActiveCenter,
	ToolsActionsTypes,
	UpdateLayer
} from '@ansyn/menu-items';
import {
	CoreActionTypes,
	ICaseMapPosition,
	ICaseMapState,
	ICoordinatesSystem,
	IOverlay,
	IOverlaysCriteria,
	LayoutKey,
	SetLayoutAction,
	SetOverlaysCriteriaAction
} from '@ansyn/core';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays';
import { map, tap, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { FeatureCollection, Point, Polygon } from 'geojson';
import { featureCollection } from '@turf/turf';
import { cloneDeep } from 'lodash';
import { Dictionary } from '@ngrx/entity/src/models';
import { ANSYN_ID } from './ansyn-id.provider';

@Injectable({
	providedIn: 'root'
})
@AutoSubscriptions({
	init: 'init',
	destroy: 'destroy'
})
export class AnsynApi {
	activeMapId;
	mapsList: ICaseMapState[];
	mapsEntities;
	activeAnnotationLayer;

	@AutoSubscription
	activateMap$: Observable<string> = this.store.select(selectActiveMapId).pipe(
		tap((activeMapId) => this.activeMapId = activeMapId)
	);

	@AutoSubscription
	maps$: Observable<ICaseMapState[]> = this.store.pipe(
		select(selectMapsList),
		tap((mapsList) => this.mapsList = mapsList)
	);

	@AutoSubscription
	mapsEntities$: Observable<Dictionary<ICaseMapState>> = this.store.pipe(
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

	onShadowMouseProduce$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SHADOW_MOUSE_PRODUCER),
		map(({ payload }: ShadowMouseProducer) => {
			return payload.point.coordinates;
		})
	);

	onSetLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(CoreActionTypes.SET_LAYOUT_SUCCESS),
		tap(() => console.log(1))
	);

	getActiveCenter$: Observable<any> = this.actions$.pipe(
		ofType(ToolsActionsTypes.SET_ACTIVE_CENTER),
		map(({ payload }: SetActiveCenter) => {
			return payload;
		})
	);

	constructor(public store: Store<any>,
				protected actions$: Actions,
				protected projectionConverterService: ProjectionConverterService,
				protected moduleRef: NgModuleRef<any>,
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

	displayOverLay(overlay: IOverlay): void {
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	}

	displayOverlayOnMap(overlay: IOverlay, mapNo: number): void {
		if (mapNo > this.mapsList.length - 1) {
			return
		}
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.mapsList[mapNo].id, forceFirstDisplay: true }));
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

	getMapPosition(): ICaseMapPosition {
		return this.mapsEntities[this.activeMapId].data.position;
	}

	goToPosition(position: Array<number>): void {
		this.store.dispatch(new GoToAction(position));
	}

	setMapPositionByRect(rect: Polygon) {
		this.store.dispatch(new SetMapPositionByRectAction({ id: this.activeMapId, rect }));
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

	init(): void {
	}

	destroy(): void {
		this.moduleRef.destroy();
		this.removeElement(this.id);
	}
}
