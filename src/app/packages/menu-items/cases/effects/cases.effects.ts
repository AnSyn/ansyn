import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	AddCaseAction, AddCaseSuccessAction, CasesActionTypes, DeleteCaseBackendSuccessAction, DeleteCaseBackendAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadCasesSuccessAction, LoadCaseSuccessAction, LoadContextsSuccessAction, LoadDefaultCaseSuccessAction,
	SelectCaseByIdAction, UpdateCaseAction, UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction, SetDefaultCaseQueryParams, LoadDefaultCaseAction, LoadContextsAction
} from '../actions/cases.actions';
import { CasesService } from '../services/cases.service';
import { ICasesState } from '../reducers/cases.reducer';
import { Case, Context } from '@ansyn/core';
import { isEmpty, isEqual } from 'lodash';

@Injectable()
export class CasesEffects {

	@Effect()
	loadCases$: Observable<LoadCasesSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)
		.withLatestFrom(this.store.select("cases"))
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
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState) => [state.active_case_id, state.selected_case.id])
		.mergeMap(([active_case_id, selected_case_id]) => {
			const actions: Action[] = [];
			if(isEqual(active_case_id, selected_case_id)){
				actions.push(new LoadDefaultCaseAction())
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
		.map(()=>{
			return new LoadCasesAction();
		})
		.share();


	@Effect()
	onUpdateCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState) => [action, state.default_case.id])
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
	addCaseSuccess$: Observable<any> = this.actions$.
	ofType(CasesActionTypes.ADD_CASE_SUCCESS)
		.map((action: AddCaseSuccessAction) => {
			return new SelectCaseByIdAction(action.payload.id);
		}).share();

	// @Effect()
	// onLoadContexts$: Observable<LoadContextsSuccessAction> = this.actions$
	// 	.ofType(CasesActionTypes.LOAD_CONTEXTS)
	// 	.withLatestFrom(this.store.select("cases"))
	// 	.switchMap(([action, state]: [LoadContextsAction, ICasesState]) => {
	// 		let observable: Observable<Context[]>;
	// 		if (state.contexts_loaded) {
	// 			observable = Observable.of(state.contexts);
	// 		} else {
	// 			observable = this.casesService.loadContexts();
	// 		}
	// 		return observable.map((contexts) => {
	// 			return new LoadContextsSuccessAction(contexts);
	// 		});
	// 	}).share();

	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE)
		.withLatestFrom(this.store.select("cases"))
		.switchMap(([action, state]: [LoadCaseAction, ICasesState]) => {
			const existing_case = state.cases.find(case_val => case_val.id === action.payload);

			if (existing_case) {
				return Observable.of(new SelectCaseByIdAction(existing_case.id) as any);
			} else {
				return this.casesService.loadCase(action.payload)
					.map(
						(data) => {
							if (data) {
								return new LoadCaseSuccessAction(data);
							} else {
								return new LoadDefaultCaseAction();
							}
						});
			}

		}).share();

	@Effect()
	loadCaseSuccess$: Observable<SelectCaseByIdAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE_SUCCESS)
		.map((action: LoadCaseSuccessAction) => {
			return new SelectCaseByIdAction(action.payload.id);
		}).share();


	@Effect()
	loadDefaultCase$: Observable<LoadDefaultCaseSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.withLatestFrom(this.store.select("cases"))
		.filter(([action, state]: [LoadDefaultCaseAction, ICasesState]) => !action.payload['context'])
		.mergeMap(([action, state]: [LoadDefaultCaseAction, ICasesState]) => {
			const actions = [];
			const defaultCase = this.casesService.getDefaultCase();
			const contextName = action.payload['context'];
			let defaultCaseQueryParams: Case;
			if (contextName) {
				const context = state.contexts.find(c => c.name === contextName);
				defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, defaultCase);
			} else {
				defaultCaseQueryParams = this.casesService.updateCaseViaQueryParmas(action.payload, defaultCase);
			}
			actions.push(new SetDefaultCaseQueryParams(defaultCaseQueryParams));
			if(isEmpty(state.default_case)){
				actions.push(new LoadDefaultCaseSuccessAction(defaultCase));
			} else {
				actions.push(new SelectCaseByIdAction(state.default_case.id))
			}
			return actions;

		}).share();

	@Effect()
	loadDefaultCaseSuccess$: Observable<SelectCaseByIdAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE_SUCCESS)
		.map(toPayload)
		.map((defaultCase: Case) => {
			return new SelectCaseByIdAction(defaultCase.id);
		}).share();

	constructor(private actions$: Actions,
				private casesService: CasesService,
				private store: Store<ICasesState>) { }
}

