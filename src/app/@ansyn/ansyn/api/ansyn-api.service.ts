import { Inject, Injectable, InjectionToken, NgModuleRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import {
	MapActionTypes,
	MapFacadeService,
	selectActiveMapId,
	selectMapsList,
	ShadowMouseProducer
} from '@ansyn/map-facade';
import { Observable, empty } from 'rxjs';
import { GoToAction, ProjectionConverterService, ToolsActionsTypes, SetActiveCenter, UpdateLayer, ILayer, selectLayersEntities, selectActiveAnnotationLayer } from '@ansyn/menu-items';
import { ICaseMapPosition, ICaseMapState, ICoordinatesSystem, IOverlay, LayoutKey, SetLayoutAction } from '@ansyn/core';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays';
import { map, tap, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { FeatureCollection } from 'geojson';
import { window } from 'd3';
import { featureCollection } from '@turf/turf';
import { cloneDeep } from 'lodash';
import { selectMaps } from '../../map-facade/reducers/map.reducer';
import { Dictionary } from '@ngrx/entity/src/models';

export const ANSYN_ID = new InjectionToken('ANSYN_ID');

@Injectable({
	providedIn: 'root'
})
@AutoSubscriptions({
	init: 'init',
	destroy: 'destroy'
})
export class AnsynApi {
	activeMapId;
	mapsList;
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
		const elem: HTMLElement = <any> document.getElementById(id);
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
	
	setAnnotations(featureCollection: FeatureCollection<any>): void {
		this.store.dispatch(new UpdateLayer(<ILayer>{ ...this.activeAnnotationLayer, data: cloneDeep(featureCollection) }));
	}

	deleteAllAnnotations(): void {
		this.setAnnotations(<FeatureCollection>(featureCollection([])));
	}

	setOverlays(overlays: IOverlay[]): void {
		this.store.dispatch(new LoadOverlaysSuccessAction(overlays, true));
	}

	changeMapLayout(layout: LayoutKey): void {
		this.store.dispatch(new SetLayoutAction(layout));
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

	
	init(): void {
	}

	destroy(): void {
		this.moduleRef.destroy();
		this.removeElement(this.id);
	}
}
