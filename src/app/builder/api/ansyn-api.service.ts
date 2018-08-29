import { EventEmitter, Inject, Injectable, InjectionToken, NgModuleRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Subscription } from 'rxjs/Subscription';
import { ShadowMouseProducer } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs';
import { ProjectionConverterService } from '@ansyn/menu-items/tools/services/projection-converter.service';
import { IMapState, mapStateSelector, selectActiveMapId, selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetLayoutAction } from '@ansyn/core/actions/core.actions';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICoordinatesSystem } from '@ansyn/core/models/coordinate-system.model';
import { Point as GeoPoint } from 'geojson';
import { geometry } from '@turf/turf';
import { BaseImageryMap } from '@ansyn/imagery/model/base-imagery-map';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { LayoutKey } from '@ansyn/core/models/layout-options.model';
import { GoToAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { casesConfig } from '@ansyn/menu-items/cases/services/cases.service';
import { ICasesConfig } from '@ansyn/menu-items/cases/models/cases-config';
import { map, take, tap } from 'rxjs/internal/operators';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
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

	pointerMove$ = new EventEmitter();
	private iMap: BaseImageryMap;

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

	getShadowMouse(cb) {
		const communicator = this.imageryCommunicatorService.provide(this.activeMapId);
		this.iMap = communicator.ActiveMap;
		this.iMap.mapObject.on('pointermove', this.onPointerMove, this);
		return cb(this.pointerMove$);
	}

	stopShadowMouse() {
		this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
		this.pointerMove$.complete();
	}


	private onPointerMove({ coordinate }: any) {
		const point = <GeoPoint>geometry('Point', coordinate);
		return this.projectionService.projectApproximately(point, this.iMap)
			.take(1)
			.do((projectedPoint) => {
				this.pointerMove$.emit(projectedPoint.coordinates);
			})
			.subscribe();
	}

	displayOverLay(overlay: IOverlay) {
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	}

	setOverlays(overlays: IOverlay[]) {
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
		this.removeElement(this.id)
	}
}
