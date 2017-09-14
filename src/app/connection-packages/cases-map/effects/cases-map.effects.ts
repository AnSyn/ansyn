import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MapActionTypes, SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { Action, Store } from '@ngrx/store';
import { Case } from '@ansyn/core/models/case.model';
import { CasesActionTypes, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { cloneDeep as _cloneDeep } from 'lodash';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';

@Injectable()
export class CasesMapEffects {
	/* Maps update case */
	@Effect()
	onMapsDataChange$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'), this.store$.select('map'))
		.map(([action, selected_case, mapState]: [any, Case, IMapState]) => {
			const updatedCase = {
				...selected_case,
				state: {
					...selected_case.state,
					maps: {
						...selected_case.state.maps,
						data: [...mapState.mapsList],
						active_map_id: mapState.activeMapId
					}
				}
			} as Case;
			return new UpdateCaseAction(updatedCase);
		});

	/* Case update maps */
	@Effect()
	selectCaseByIdUpdateMapsData$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases').pluck<any, Case>('selected_case'))
		.map(([action, selected_case]) => _cloneDeep(selected_case.state.maps))
		.map(({ active_map_id, data }) => {
			return new SetMapsDataActionStore({ mapsList: data, activeMapId: active_map_id })
		});

	constructor(private actions$: Actions, private store$: Store<any>) {
	}
}
