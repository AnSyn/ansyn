import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import {
	CasesActionTypes, LoadCaseAction,
	LoadDefaultCaseAction, SelectCaseByIdAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { isEmpty, isEqual } from 'lodash';
import { IAppState } from '../app-reducers.module';
import { ICasesState } from '../../packages/menu-items/cases/reducers/cases.reducer';
import { Router } from '@angular/router';
import { go, routerActions } from '@ngrx/router-store';

@Injectable()
export class RouterAppEffects {

	@Effect()
	onUpdateLocationDefaultCase: Observable<Action> = this.actions$
		.ofType(routerActions.UPDATE_LOCATION)
		.withLatestFrom(this.store$.select('cases'), (action, state: ICasesState) => {
			return [action, state]
		})
		.filter(
			([action, state]: any) => {
				const case_id = action.payload.path.split("/")[1];
				return (isEmpty(case_id) || case_id[0] === '?')
					&& (isEmpty(state.selected_case) || isEmpty(state.default_case) || !isEqual(state.selected_case.id, state.default_case.id));
			}
		)
		.map( ([action]: any) => {
			const q_params = this.router.parseUrl(action.payload.path);
			return new LoadDefaultCaseAction(q_params)
		});

	@Effect()
	onUpdateLocationCase$: Observable<Action> = this.actions$
		.ofType(routerActions.UPDATE_LOCATION)
		.withLatestFrom(this.store$.select('cases'), (action, state: ICasesState) => {
			const case_id = action.payload.path.split("/")[1];
			return [case_id, state.selected_case]
		})
		.filter(
			([case_id, selected_case]: any) => {
				return !isEmpty(case_id) &&
					   case_id[0] !== '?' &&
					  (isEmpty(selected_case) || !isEqual(case_id, selected_case.id));
			}
		)
		.map( ([case_id]: any) => {
			return new LoadCaseAction(case_id);
		});

	@Effect()
	selectCaseUpdateRouter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]:[any, ICasesState]) => {
			return !isEmpty(action) && !(state.default_case && action.payload === state.default_case.id)
		})
		.map(([action, state]: [SelectCaseByIdAction, ICasesState]) => {
			return go(['', action.payload]);
		});

	@Effect()
	selectCaseById$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [Action, ICasesState]) => {
			return isEqual(action.payload, state.default_case.id);
		})
		.map(([caseId, state]: [string, ICasesState]) => {
			return go(['', ''])
		});

	constructor(private actions$: Actions, private store$: Store<IAppState>, private router: Router) {
	}
}
