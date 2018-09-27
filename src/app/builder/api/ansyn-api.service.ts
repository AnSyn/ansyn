import { Inject, Injectable, InjectionToken, NgModuleRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { MapActionTypes, ShadowMouseProducer } from '@ansyn/map-facade';
import { Observable } from 'rxjs';
import { ProjectionConverterService } from '@ansyn/menu-items';
import { selectActiveMapId, selectMapsList } from '@ansyn/map-facade';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { Overlay } from '@ansyn/core';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays';
import { SetLayoutAction } from '@ansyn/core';
import { SelectCaseAction } from '@ansyn/menu-items';
import { ICoordinatesSystem } from '@ansyn/core';
import { ProjectionService } from '@ansyn/imagery';
import { LayoutKey } from '@ansyn/core';
import { GoToAction } from '@ansyn/menu-items';
import { casesConfig } from '@ansyn/menu-items';
import { ICasesConfig } from '@ansyn/menu-items';
import { map, tap } from 'rxjs/internal/operators';
import { MapFacadeService } from '@ansyn/map-facade';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { DynamicsAnsynModule } from '../dynamic-ansyn/dynamic-ansyn.module';
import { IWindowLayout } from '../reducers/builder.reducer';
import { SetWindowLayout } from '../actions/builder.actions';

export const ANSYN_BUILDER_ID = new InjectionToken('ANSYN_BUILDER_ID');

@Injectable()
@AutoSubscriptions({
	init: 'init',
	destroy: 'destroy'
})
export class AnsynApi {
	activeMapId;
	mapsList;

	@AutoSubscription
	activateMap$ = <Observable<string>>this.store.select(selectActiveMapId).pipe(
		tap((activeMapId) => this.activeMapId = activeMapId)
	);

	@AutoSubscription
	maps$ = this.store.pipe(
		select(selectMapsList),
		tap((mapsList) => this.mapsList = mapsList)
	);

	onShadowMouseProduce$ = this.actions$.pipe(
		ofType(MapActionTypes.SHADOW_MOUSE_PRODUCER),
		map(({ payload }: ShadowMouseProducer) => {
			return payload.point.coordinates;
		})
	);

	constructor(public store: Store<any>,
				protected actions$: Actions,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected projectionService: ProjectionService,
				protected projectionConverterService: ProjectionConverterService,
				@Inject(casesConfig) public casesConfig: ICasesConfig,
				protected moduleRef: NgModuleRef<DynamicsAnsynModule>,
				@Inject(ANSYN_BUILDER_ID) public id: string) {
		this.init();
	}

	removeElement(id) {
		const elem: HTMLElement = <any> document.getElementById(id);
		if (elem) {
			elem.innerHTML = '';
		}
	}

	setOutSourceMouseShadow(coordinates) {
		this.store.dispatch(new ShadowMouseProducer({ point: { coordinates, type: 'point' }, outsideSource: true }));
	}

	displayOverLay(overlay: Overlay) {
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	}

	setOverlays(overlays: Overlay[]) {
		this.store.dispatch(new LoadOverlaysSuccessAction(overlays, true));
	}

	changeMapLayout(layout: LayoutKey) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	loadDefaultCase() {
		this.store.dispatch(new SelectCaseAction(this.casesConfig.defaultCase));
	}

	changeWindowLayout(windowLayout: IWindowLayout) {
		this.store.dispatch(new SetWindowLayout(windowLayout));
	}

	transfromHelper(position, convertMethodFrom: ICoordinatesSystem, convertMethodTo: ICoordinatesSystem) {
		const conversionValid = this.projectionConverterService.isValidConversion(position, convertMethodFrom);
		if (conversionValid) {
			this.projectionConverterService.convertByProjectionDatum(position, convertMethodFrom, convertMethodTo);
		}
	}

	getMapPosition() {
		return MapFacadeService.mapById(this.mapsList, this.activeMapId).data.position;
	}

	goToPosition(position: Array<number>) {
		this.store.dispatch(new GoToAction(position));
	}

	init() {
	}

	destroy() {
		this.moduleRef.destroy();
		this.removeElement(this.id);
	}
}
