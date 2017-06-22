import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	AddCaseAction, AddCaseSuccessAction, CasesActionTypes, DeleteCaseSuccessAction, LoadCaseAction,
	LoadCasesAction,
	LoadCasesSuccessAction, LoadCaseSuccessAction, LoadContextsSuccessAction, LoadDefaultCaseSuccessAction,
	SelectCaseByIdAction, UpdateCaseAction, LoadDefaultCaseAction, UpdateCaseBackendAction, UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { CasesService } from '../services/cases.service';
import { ICasesState } from '../reducers/cases.reducer';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';
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
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState) => state.active_case_id)
		.switchMap((active_case_id: string) => {
			return this.casesService.removeCase(active_case_id).map((deleted_case: Case) => {
				return new DeleteCaseSuccessAction(deleted_case);
			});
		}).share();

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

	@Effect()
	onLoadContexts$: Observable<LoadContextsSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CONTEXTS)
		.withLatestFrom(this.store.select("cases"))
		.switchMap(([action, state]: [any, ICasesState]) => {
			let observable: Observable<Context[]>;
			if (state.contexts_loaded) {
				observable = Observable.of(state.contexts);
			} else {
				observable = this.casesService.loadContexts();
			}
			return observable.map((contexts) => {
				return new LoadContextsSuccessAction(contexts);
			});
		}).share();

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
		.filter(([action, state]: [LoadDefaultCaseAction, ICasesState]) => isEmpty(state.default_case))
		.switchMap(([action, state]: [LoadDefaultCaseAction, ICasesState]) => {
			return this.casesService.loadDefaultCase().map((default_case) => {
				return new LoadDefaultCaseSuccessAction(default_case);
			});
		}).share();

	@Effect()
	loadDefaultCaseSuccess$: Observable<SelectCaseByIdAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE_SUCCESS)
		.map((action: LoadCaseSuccessAction) => {
			return new SelectCaseByIdAction(action.payload.id);
		}).share();

	@Effect()
	selectDefaultCase$: Observable<UpdateCaseAction | void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.map(toPayload)
		.withLatestFrom(this.store.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => {
			return isEqual(case_id, state.default_case.id);
		})
		.map(([caseId, state]: [string, ICasesState]) => {
			const updated_case = this.casesService.updateCaseViaQueryParmas(state.selected_case, state.default_case_query_params);
			return new UpdateCaseAction(updated_case);
		});

	constructor(private actions$: Actions,
				private casesService: CasesService,
				private store: Store<ICasesState>) { }
}

