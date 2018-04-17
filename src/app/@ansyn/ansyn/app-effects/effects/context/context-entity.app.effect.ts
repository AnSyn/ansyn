import { Actions, Effect } from '@ngrx/effects';
import { ImageryCreatedAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CaseMapState } from '@ansyn/core';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ImageryCommunicatorService, IVisualizerEntity } from '@ansyn/imagery';
import { ContextEntityVisualizer } from '../../../app-providers/app-visualizers/context-entity.visualizer';
import { SetSpecialObjectsActionStore } from '@ansyn/overlays/actions/overlays.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/interfaces';


@Injectable()
export class ContextEntityAppEffects {

	/**
	 * @type Effect
	 * @name displayEntityFromSelectedCase$
	 * @ofType SelectCaseAction
	 * @filter case has contextEntities
	 */
	@Effect()
	displayEntityFromSelectedCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => Boolean(payload.state.contextEntities))
		.switchMap(({ payload }: SelectCaseAction) => {
			const observables = [];
			payload.state.maps.data.forEach((mapState: CaseMapState) => {
				const overlayDate = mapState.data.overlay ? mapState.data.overlay.date : null;
				observables.push(this.setContextEntity(mapState.id, overlayDate, payload.state.contextEntities));
			});

			return Observable.forkJoin(observables).map(() => {
				return { payload };
			});
		}).mergeMap(({ payload }: SelectCaseAction) => {

			const actions = [];

			payload.state.contextEntities.forEach(contextEntity => {
				const specialObject: OverlaySpecialObject = {
					id: contextEntity.id,
					date: contextEntity.date,
					shape: 'star'
				} as OverlaySpecialObject;
				actions.push(new SetSpecialObjectsActionStore([specialObject]));
			});

			return actions;
		});

	/**
	 * @type Effect
	 * @name displayEntityFromNewMap$
	 * @ofType MapInstanceChangedAction
	 * @dependencies cases, map
	 * @filter selected case has contextEntities
	 */
	@Effect({ dispatch: false })
	displayEntityFromNewMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_CREATED)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector))
		.filter(([action, caseState]: [ImageryCreatedAction, ICasesState, IMapState]) => Boolean(caseState.selectedCase.state.contextEntities))
		.switchMap(([action, caseState, mapStore]: [ImageryCreatedAction, ICasesState, IMapState]) => {
			const mapState: CaseMapState = MapFacadeService.mapById(mapStore.mapsList, action.payload.id);
			const overlayDate = mapState.data.overlay ? mapState.data.overlay.date : null;
			return this.setContextEntity(mapState.id, overlayDate, caseState.selectedCase.state.contextEntities);
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected communicatorService: ImageryCommunicatorService) {
	}

	private setContextEntity(mapId: string, overlayDate: Date, contextEntities: IVisualizerEntity[]): Observable<boolean> {
		const communicatorHandler = this.communicatorService.provide(mapId);
		if (communicatorHandler) {
			const visualizer = communicatorHandler.getPlugin<ContextEntityVisualizer>(ContextEntityVisualizer);
			if (visualizer) {
				return visualizer.setEntities(contextEntities);
			}
		}

		return Observable.of(true);
	}
}
