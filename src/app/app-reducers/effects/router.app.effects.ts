import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import {
	CasesActionTypes, LoadCaseAction,
	LoadDefaultCaseAction, SelectCaseByIdAction
} from '@ansyn/menu-items/cases';
import { isEmpty, isEqual } from 'lodash';
import { IAppState } from '../app-reducers.module';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { go, routerActions, RouterState } from '@ngrx/router-store';
import { RouterStoreHelperService } from '../services/router-store-helper.service';

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
				const case_id = this.routerStoreHelperService.caseIdViaPath(action.payload.path);
				return (isEmpty(case_id) || case_id[0] === '?')
					&& (isEmpty(state.selected_case) || isEmpty(state.default_case) || !isEqual(state.selected_case.id, state.default_case.id));
			}
		)
		.mergeMap( ([action]: any) => {
			const q_params = this.routerStoreHelperService.queryParamsViaPath(action.payload.path);
			return [
				new LoadDefaultCaseAction(q_params)
			];
		});

	@Effect()
	onUpdateLocationCase$: Observable<Action> = this.actions$
		.ofType(routerActions.UPDATE_LOCATION)
		.withLatestFrom(this.store$.select('cases'), (action, state: ICasesState) => {
			const case_id = this.routerStoreHelperService.caseIdViaPath(action.payload.path);
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
		.withLatestFrom(this.store$,
			(action: SelectCaseByIdAction, state:IAppState): [SelectCaseByIdAction, ICasesState, RouterState] => [action, state.cases, state.router]
		)
		.filter(
			( [action, cases, router]: [SelectCaseByIdAction, ICasesState, RouterState]) => {
				const case_id = this.routerStoreHelperService.caseIdViaPath(router.path);
				return case_id !== cases.selected_case.id &&
					(!cases.default_case || action.payload !== cases.default_case.id)
			})
		.map(([action, cases, router]: [SelectCaseByIdAction, ICasesState, RouterState])=>{
			return go(['', action.payload]);
		});

	@Effect()
	selectDefulatCaseById$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [Action, ICasesState]) => {
			return isEqual(action.payload, state.default_case.id);
		})
		.map(() => {
			return go(['', ''])
		});

	constructor(private actions$: Actions, private store$: Store<IAppState>, private routerStoreHelperService: RouterStoreHelperService) {}
}
