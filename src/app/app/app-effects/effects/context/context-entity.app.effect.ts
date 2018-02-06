import { Actions, Effect } from '@ngrx/effects';
import { AddMapInstanceAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CaseMapState } from '@ansyn/core';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { isNil as _isNil } from 'lodash';
import { ImageryCommunicatorService, IVisualizerEntity } from '@ansyn/imagery';
import {
	ContextEntityVisualizer,
	ContextEntityVisualizerType
} from '../../../app-providers/app-visualizers/context-entity.visualizer';
import { SetSpecialObjectsActionStore } from '@ansyn/overlays/actions/overlays.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';


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
		.filter(({ payload }: SelectCaseAction) => !_isNil(payload.state.contextEntities))
		.mergeMap(({ payload }: SelectCaseAction) => {
			payload.state.maps.data.forEach((mapState: CaseMapState) => {
				const overlayDate = mapState.data.overlay ? mapState.data.overlay.date : null;
				this.setContextEntity(mapState.id, overlayDate, payload.state.contextEntities);
			});

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
		.ofType(MapActionTypes.ADD_MAP_INSTANCE)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector))
		.filter(([action, caseState, mapStore]: [AddMapInstanceAction, ICasesState, IMapState]) => !_isNil(caseState.selectedCase.state.contextEntities))
		.map(([action, caseState, mapStore]: [AddMapInstanceAction, ICasesState, IMapState]) => {
			const mapState: CaseMapState = MapFacadeService.mapById(mapStore.mapsList, action.payload.currentCommunicatorId);
			const overlayDate = mapState.data.overlay ? mapState.data.overlay.date : null;
			this.setContextEntity(mapState.id, overlayDate, caseState.selectedCase.state.contextEntities);
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected communicatorService: ImageryCommunicatorService) {
	}

	private setContextEntity(mapId: string, overlayDate: Date, contextEntities: IVisualizerEntity[]) {
		const communicatorHandler = this.communicatorService.provide(mapId);
		if (communicatorHandler) {
			const visualizer = <ContextEntityVisualizer>communicatorHandler.getVisualizer(ContextEntityVisualizerType);
			if (visualizer) {
				visualizer.setEntities(contextEntities);
			}
		}
	}
}
