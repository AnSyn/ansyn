import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Action, Store } from '@ngrx/store';
import { Case } from '@ansyn/core/models/case.model';
import { CasesActionTypes, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { cloneDeep as _cloneDeep } from 'lodash';

@Injectable()
export class CasesMapEffects {
	/* Maps update case */
	@Effect()
	onMapsDataChange$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'))
		.map(([{mapsList, activeMapId}, selected_case]: [any, Case]) => {
			const activeMapChange = activeMapId ? {active_map_id: activeMapId} : {};
			const mapsListChange = mapsList ? {data: mapsList} : {};

			const updatedCase = {
				...selected_case,
				state: {
					...selected_case.state,
					maps: {
						...selected_case.state.maps,
						...activeMapChange,
						...mapsListChange
					}}} as Case;
			return new UpdateCaseAction(updatedCase)
		});

	/* Case update maps */
	@Effect()
	selectCaseByIdUpdateMapsData$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases').pluck<any, Case>('selected_case'))
		.map(([action, selected_case]) => _cloneDeep(selected_case.state.maps))
		.map(({active_map_id, data}) => new SetMapsDataActionStore({mapsList: data, activeMapId: active_map_id}));

	constructor(private actions$: Actions, private store$: Store<any>){}
}
