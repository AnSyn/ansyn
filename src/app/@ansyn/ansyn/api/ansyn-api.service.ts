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
import { Observable } from 'rxjs';
import { GoToAction, ProjectionConverterService, ToolsActionsTypes, SetActiveCenter } from '@ansyn/menu-items';
import { ICaseMapPosition, ICaseMapState, ICoordinatesSystem, IOverlay, LayoutKey, SetLayoutAction } from '@ansyn/core';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays';
import { map, tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

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

	@AutoSubscription
	activateMap$: Observable<string> = this.store.select(selectActiveMapId).pipe(
		tap((activeMapId) => this.activeMapId = activeMapId)
	);

	@AutoSubscription
	maps$: Observable<ICaseMapState[]> = this.store.pipe(
		select(selectMapsList),
		tap((mapsList) => this.mapsList = mapsList)
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
		return MapFacadeService.mapById(this.mapsList, this.activeMapId).data.position;
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
