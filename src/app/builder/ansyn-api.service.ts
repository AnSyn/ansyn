import { EventEmitter, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Subscription } from 'rxjs/Subscription';
import { MapActionTypes, ShadowMouseProducer } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetLayoutAction, SetWindowLayout } from '@ansyn/core/actions/core.actions';
import { LoadDefaultCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { WindowLayout } from '@ansyn/core/reducers/core.reducer';
import { CoordinatesSystem } from '@ansyn/core/models/coordinate-system.model';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { IMap } from '@ansyn/imagery/model/imap';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { LayoutKey } from '@ansyn/core/models/layout-options.model';
import { GoToAction } from '@ansyn/menu-items/tools/actions/tools.actions';

@Injectable()
export class AnsynApi {


	mapPosition$ = this.actions$.ofType<Action>(MapActionTypes.POSITION_CHANGED);

	activeMapId;
	activateMap$ = <Observable<string>>this.store.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.do(activeMapId => {
			this.activeMapId = activeMapId;
		})
		.distinctUntilChanged();

	private subscriptions: Array<Subscription> = [];
	pointerMove$ = new EventEmitter();
	private iMap: IMap;

	constructor(public store: Store<any>,
				protected actions$: Actions,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected projectionService: ProjectionService,
				protected projectionConverterService: ProjectionConverterService) {

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

	displayOverLay(overlay: Overlay) {
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	}

	changeMapLayout(layout: LayoutKey) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	loadDefaultCase() {
		this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeWindowLayout(windowLayout: WindowLayout) {
		this.store.dispatch(new SetWindowLayout({ windowLayout }));
	}

	transfromHelper(position, convertMethodFrom: CoordinatesSystem, convertMethodTo: CoordinatesSystem) {
		const conversionValid = this.projectionConverterService.isValidConversion(position, convertMethodFrom);
		if (conversionValid) {
			this.projectionConverterService.convertByProjectionDatum(position, convertMethodFrom, convertMethodTo);
		}

	}

	goToPosition(position: Array<number>) {
		this.store.dispatch(new GoToAction(position));
	}
}
