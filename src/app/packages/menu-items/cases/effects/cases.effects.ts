import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	AddCaseAction,
	AddCaseSuccessAction,
	CasesActionTypes,
	DeleteCaseBackendAction,
	DeleteCaseBackendSuccessAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadCasesSuccessAction,
	LoadDefaultCaseAction,
	SelectCaseAction,
	SelectCaseByIdAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { CasesService } from '../services/cases.service';
import { ICasesState } from '../reducers/cases.reducer';
import { Case } from '@ansyn/core';
import { isEmpty, isEqual, isNil } from 'lodash';

import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';

@Injectable()
export class CasesEffects {

	@Effect()
	loadCases$: Observable<LoadCasesSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)
		.withLatestFrom(this.store.select('cases'))
		.switchMap(([action, state]: [LoadCasesAction, ICasesState]) => {
			let last_case: Case = state.cases[state.cases.length - 1];
			let last_id = last_case ? last_case.id : '-1';
			return this.casesService.loadCases(last_id)
				.map(new_cases => {
					return new LoadCasesSuccessAction(new_cases);
				});
		}).share();


	@Effect()
	onAddCase$: Observable<AddCaseAction> = this.actions$
		.ofType(CasesActionTypes.ADD_CASE)
		.switchMap((action) => {
			return this.casesService.createCase(action.payload)
				.map((added_case: Case) => {
					return new AddCaseSuccessAction(added_case);
				});
		}).share();

	@Effect()
	onDeleteCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE)
		.withLatestFrom(this.store.select('cases'), (action, state: ICasesState) => [state.active_case_id, state.selected_case.id])
		.mergeMap(([active_case_id, selected_case_id]) => {
			const actions: Action[] = [];
			if (isEqual(active_case_id, selected_case_id)) {
				actions.push(new LoadDefaultCaseAction());
			}
			actions.push(new DeleteCaseBackendAction(active_case_id));
			return actions;
		}).share();

	@Effect()
	onDeleteCaseBackend$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE_BACKEND)
		.map(toPayload)
		.switchMap((deleted_case_id) => {
			return this.casesService.removeCase(deleted_case_id).map((deleted_case: Case) => {
				return new DeleteCaseBackendSuccessAction(deleted_case);
			});
		}).share();

	@Effect()
	onDeleteCaseBackendSuccess$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE_BACKEND_SUCCESS)
		.withLatestFrom(this.store.select('cases'))
		.filter(([action, state]: [DeleteCaseBackendSuccessAction, ICasesState]) => {
			const cases_length = state.cases.length;
			const limit = this.casesService.paginationLimit;
			return cases_length <= limit;
		})
		.map(() => {
			return new LoadCasesAction();
		})
		.share();


	@Effect()
	onUpdateCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE)
		.withLatestFrom(this.store.select('cases'), (action, state: ICasesState) => [action, CasesService.defaultCase.id])
		.filter(([action, default_case_id]: [UpdateCaseAction, string]) => action.payload.id !== default_case_id)
		.map(([action]: [UpdateCaseAction]) => {
			return new UpdateCaseBackendAction(action.payload);
		}).share();


	@Effect()
	onUpdateCaseBackend$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE_BACKEND)
		.switchMap((action: UpdateCaseAction) => {
			return this.casesService.wrapUpdateCase(action.payload).map(updated_case => {
				return new UpdateCaseBackendSuccessAction(updated_case);
			});
		}).share();

	@Effect()
	onUpdateCaseBackendSuccess$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS)
		.switchMap((action: UpdateCaseAction) => {
			return Observable.empty();
		}).share();


	@Effect({ dispatch: false })
	openModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.OPEN_MODAL)
		.map((action) => {
			return action;
		}).share();

	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.CLOSE_MODAL)
		.share();


	@Effect()
	addCaseSuccess$: Observable<any> = this.actions$.ofType(CasesActionTypes.ADD_CASE_SUCCESS)
		.map((action: AddCaseSuccessAction) => {
			return new SelectCaseByIdAction(action.payload.id);
		}).share();


	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE)
		.withLatestFrom(this.store.select('cases'))
		.switchMap(([action, state]: [LoadCaseAction, ICasesState]) => {
			const existing_case = state.cases.find(case_val => case_val.id === action.payload);
			if (existing_case) {
				return Observable.of(new SelectCaseByIdAction(existing_case.id) as any);
			} else {
				return this.casesService.loadCase(action.payload)
					.map((caseValue: Case) => new SelectCaseAction(caseValue))
					.catch(() => Observable.of(new LoadDefaultCaseAction()));
			}

		}).share();

	@Effect()
	loadDefaultCase$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => !action.payload.context)
		.map((action: LoadDefaultCaseAction) => {
			const defaultCaseQueryParams: Case = this.casesService.updateCaseViaQueryParmas(action.payload, CasesService.defaultCase);
			return new SelectCaseAction(defaultCaseQueryParams);
		}).share();

	@Effect()
	loadDefaultCaseContext$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => action.payload.context)
		.switchMap((action: LoadDefaultCaseAction) => {
			return this.actions$
				.ofType(CasesActionTypes.LOAD_CONTEXTS_SUCCESS)
				.withLatestFrom(this.store.select('cases'), (_, cases) => cases)
				.map((state: ICasesState) => {
					const contextName = action.payload.context;
					let defaultCaseQueryParams: Case;
					const context = state.contexts.find(c => c.name === contextName);
					if (context) {
						defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, CasesService.defaultCase, action.payload);
					} else {
						defaultCaseQueryParams = this.casesService.updateCaseViaQueryParmas({}, CasesService.defaultCase);
					}
					return new SelectCaseAction(defaultCaseQueryParams);
				});
		});


	@Effect()
	onSelectCaseById$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store.select('cases'))
		.filter(([action, casesState]: [SelectCaseByIdAction, ICasesState]) => !casesState.selected_case || (casesState.selected_case.id !== action.payload))
		.map(([action, casesState]: [SelectCaseByIdAction, ICasesState]) => {
			let sCase = casesState.cases.find(({ id }) => id === action.payload);
			return new SelectCaseAction(sCase);
		});



	constructor(private actions$: Actions,
				private casesService: CasesService,
				private store: Store<ICasesState>) {
	}
}

