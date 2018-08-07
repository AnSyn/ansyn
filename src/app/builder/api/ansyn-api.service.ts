import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Subscription } from 'rxjs/Subscription';
import { ShadowMouseProducer } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs';
import { ProjectionConverterService } from '@ansyn/menu-items/tools/services/projection-converter.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetLayoutAction } from '@ansyn/core/actions/core.actions';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICoordinatesSystem } from '@ansyn/core/models/coordinate-system.model';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { BaseImageryMap } from '@ansyn/imagery/model/base-imagery-map';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { LayoutKey } from '@ansyn/core/models/layout-options.model';
import { GoToAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { IWindowLayout } from '@builder/reducers/builder.reducer';
import { SetWindowLayout } from '@builder/actions/builder.actions';
import { casesConfig } from '@ansyn/menu-items/cases/services/cases.service';
import { ICasesConfig } from '@ansyn/menu-items/cases/models/cases-config';

@Injectable()
export class AnsynApi {
	activeMapId;
	activateMap$ = <Observable<string>>this.store.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.do(activeMapId => {
			this.activeMapId = activeMapId;
		})
		.distinctUntilChanged();

	private subscriptions: Array<Subscription> = [];
	pointerMove$ = new EventEmitter();
	private iMap: BaseImageryMap;

	constructor(public store: Store<any>,
				protected actions$: Actions,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected projectionService: ProjectionService,
				protected projectionConverterService: ProjectionConverterService,
				@Inject(casesConfig) public casesConfig: ICasesConfig) {

		this.subscriptions.push(
			this.activateMap$.subscribe()
		);
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
		const point = <GeoPoint> turf.geometry('Point', coordinate);
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

	goToPosition(position: Array<number>) {
		this.store.dispatch(new GoToAction(position));
	}
}
