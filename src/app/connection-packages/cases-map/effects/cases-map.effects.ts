import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { ActiveMapChangedAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Action, Store } from '@ngrx/store';
import { Case } from '@ansyn/core/models/case.model';
import { CasesActionTypes, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';

@Injectable()
export class CasesMapEffects {
	/* Maps update case */  				// new OverlaysMarkupAction(CasesService.getOverlaysMarkup(updatedCase))


	@Effect()
	onActiveMapChanges$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select('cases').pluck<any, Case>('selected_case'))
		.filter(([{payload}, {state}]: [ActiveMapChangedAction, Case]): any =>
			state.maps.active_map_id !== payload
		)
		.map(([{payload}, selected_case]: [ActiveMapChangedAction, Case]) => {
			const updatedCase: Case = {
				...selected_case,
				state: {
					...selected_case.state,
					maps: {
						...selected_case.state.maps,
						active_map_id: payload
					}}};
			return new UpdateCaseAction(updatedCase);
		});

	@Effect()
	onMapsDataChange$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'))
		.map(([{payload}, selected_case]: [SetMapsDataActionStore, Case]) => {
			const updatedCase: Case = {
				...selected_case,
				state: {
					...selected_case.state,
					maps: {
						...selected_case.state.maps,
						data: payload
					}}};
			console.log("too many times!")
			return new UpdateCaseAction(updatedCase)
		});

	/* Case update maps */
	@Effect()
	onSelectCaseByIdActiveMapChange$: Observable<Action> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'), (action, {state}) => state.maps)
		.map(({active_map_id}) => new ActiveMapChangedAction(active_map_id));

	@Effect()
	selectCaseByIdUpdateMapsData$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases').pluck<any, Case>('selected_case'))
		.map(([action, selected_case]) => new SetMapsDataActionStore(selected_case.state.maps.data));

	constructor(private actions$: Actions, private store$: Store<any>){}
}
