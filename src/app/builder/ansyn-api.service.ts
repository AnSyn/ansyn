import { EventEmitter, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from '@ansyn/core/index';
import { Actions } from '@ngrx/effects';
import { LoadDefaultCaseAction } from '@ansyn/menu-items';
import { VisualizersAppEffects } from '@ansyn/ansyn';
import { Overlay } from '@ansyn/core';
import { DisplayOverlayAction } from '@ansyn/overlays';
import { IMapState, mapStateSelector } from '@ansyn/map-facade';
import { Subscription } from 'rxjs/Subscription';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';
import { CoordinatesSystem } from '@ansyn/core/models';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';

@Injectable()
export class AnsynApi {

	mouseShadow$ = this.visualizersAppEffects$.onStartMapShadow$.mergeMap(res => res);

	mapPosition$ = this.actions$.ofType<Action>(MapActionTypes.POSITION_CHANGED);

	activateMap$ = <Observable<string>>this.store.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.do(activeMapId => {
			this.activeMapId = activeMapId;
		})
		.distinctUntilChanged();

	activeMapId;
	private subscriptions: Array<Subscription> = [];
	pointerMove$ = new EventEmitter();

	constructor(public store: Store<any>,
				protected actions$: Actions,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected visualizersAppEffects$: VisualizersAppEffects,
				protected projectionConverterService: ProjectionConverterService) {

		this.subscriptions.push(
			this.activateMap$.subscribe(),
			this.mouseShadow$.subscribe()
		);

		this.imageryCommunicatorService
			.instanceCreated
			.map(({ id }) => this.imageryCommunicatorService.provide(id))
			.do((comm: CommunicatorEntity) => {
				comm.pointerMove
					.do((event) => this.pointerMove$.emit({ mapId: comm.id, event }))
					.subscribe();
			})
			.subscribe();

	}


	displayOverLay(overlay: Overlay) {
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	}

	changeMapLayout(layout) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	loadDefaultCase() {
		this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeWindowLayout(windowLayout: WindowLayout) {
		this.store.dispatch(new SetWindowLayout({ windowLayout }));
	}

	goToPosition(input) {
		const activeCenterProjDatum: CoordinatesSystem = { datum: 'wgs84', projection: 'geo' };

		// const conversionValid = this.projectionConverterService.isValidConversion(input, );
		// if (conversionValid) {
		// 	const goToInput = this.projectionConverterService.convertByProjectionDatum(this.inputs.from, this.from, activeCenterProjDatum);
		// 	this.store$.dispatch(new GoToAction(goToInput));
		// }
	}


}
