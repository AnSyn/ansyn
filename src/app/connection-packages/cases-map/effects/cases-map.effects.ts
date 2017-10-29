import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MapActionTypes, SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { Store } from '@ngrx/store';
import { Case } from '@ansyn/core/models/case.model';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { cloneDeep as _cloneDeep } from 'lodash';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';

@Injectable()
export class CasesMapEffects {

	/**
	 * @type Effect
	 * @name onMapsDataChange$
	 * @ofType SetMapsDataActionStore
	 * @dependencies cases, map
	 * @action UpdateCaseAction
	 */
	@Effect()
	onMapsDataChange$: Observable<UpdateCaseAction> = this.actions$
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(toPayload)
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), this.store$.select(mapStateSelector))
		.map(([action, selectedCase, mapState]: [any, Case, IMapState]) => {
			const updatedCase = {
				...selectedCase,
				state: {
					...selectedCase.state,
					maps: {
						...selectedCase.state.maps,
						data: [...mapState.mapsList],
						activeMapId: mapState.activeMapId
					}
				}
			} as Case;
			return new UpdateCaseAction(updatedCase);
		});

	/**
	 * @type Effect
	 * @name selectCaseByIdUpdateMapsData$
	 * @ofType SelectCaseAction
	 * @action SetMapsDataActionStore
	 */
	@Effect()
	selectCaseByIdUpdateMapsData$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.map(({ payload }: SelectCaseAction) => _cloneDeep(payload.state.maps))
		.map(({ activeMapId, data }) => {
			return new SetMapsDataActionStore({ mapsList: data, activeMapId: activeMapId });
		});

	constructor(private actions$: Actions, private store$: Store<any>) {
	}
}
