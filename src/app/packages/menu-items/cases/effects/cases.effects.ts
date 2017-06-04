import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	AddCaseAction, AddCaseSuccessAction, CasesActionTypes, CloseModalAction, DeleteCaseSuccessAction, LoadCaseAction,
	LoadCasesAction,
	LoadCasesSuccessAction, LoadCaseSuccessAction, LoadContextsSuccessAction, LoadDefaultCaseSuccessAction,
	SelectCaseByIdAction, UpdateCaseAction,
	UpdateCaseSuccessAction
} from '../actions/cases.actions';
import { CasesService } from '../services/cases.service';
import { ICasesState } from '../reducers/cases.reducer';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';

@Injectable()
export class CasesEffects {

	@Effect()
	loadCases$: Observable<LoadCasesSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)

		.withLatestFrom(this.store.select("cases"))
		.switchMap( ([action, state]: [LoadCasesAction, ICasesState]) => {
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
			return this.casesService.removeCase(active_case_id).map((deleted_case: Case ) => {
				return new DeleteCaseSuccessAction(deleted_case);
			});
		}).share();

	@Effect()
	onUpdateCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState) => [action, state.default_case.id])
		.switchMap( ([action, default_case_id]: [UpdateCaseAction, string]) => {
			if(action.payload.id === default_case_id) {
				return Observable.of(new UpdateCaseSuccessAction(action.payload));
			}
			return this.casesService.updateCase(action.payload)
				.map((updated_case: Case ) => {
					return new UpdateCaseSuccessAction(updated_case);
				});
		}).share();

	@Effect({dispatch: false})
	openModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.OPEN_MODAL)
		.map((action) => {
			return action;
		}).share();

	@Effect({dispatch: false})
	closeModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.CLOSE_MODAL)
		.share();

	@Effect()
	closeModalAction$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE_SUCCESS, CasesActionTypes.DELETE_CASE_SUCCESS, CasesActionTypes.ADD_CASE_SUCCESS)
		.map(() => new CloseModalAction())
		.share();

	@Effect({dispatch: false})
	addCaseSuccess$: Observable<any> = this.actions$.
	ofType(CasesActionTypes.ADD_CASE_SUCCESS).share();

	@Effect()
	onLoadContexts$: Observable<LoadContextsSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CONTEXTS)
		.withLatestFrom(this.store.select("cases"))
		.switchMap( ([action, state]: [any, ICasesState])  => {
			let observable: Observable<Context[]>;
			if(state.contexts_loaded) {
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
		.switchMap( ([action, state]: [LoadCaseAction, ICasesState]) => {
			const existing_case = state.cases.find(case_val => case_val.id == action.payload);

			if(existing_case) {
				return Observable.of(new SelectCaseByIdAction(existing_case.id) as any);
			} else {
				return this.casesService.loadCase(action.payload)
					.map(new_cases => {
						return new LoadCaseSuccessAction(new_cases);
					});
			}

		}).share();

	@Effect()
	loadCaseSuccess$: Observable<SelectCaseByIdAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE_SUCCESS)
		.map( (action: LoadCaseSuccessAction) => {
			return new SelectCaseByIdAction(action.payload.id);
		}).share();


	@Effect()
	loadDefaultCase$: Observable<LoadDefaultCaseSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.switchMap( (action: LoadCaseSuccessAction) => {
			return this.casesService.loadDefaultCase().map((default_case) => {
				return new LoadDefaultCaseSuccessAction(default_case );
			});
		}).share();

	@Effect()
	loadDefaultCaseSuccess$: Observable<SelectCaseByIdAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE_SUCCESS)
		.map( (action: LoadCaseSuccessAction) => {
			return new SelectCaseByIdAction(action.payload.id);
		}).share();

	constructor(private actions$: Actions, private casesService: CasesService, private store: Store<ICasesState>){}	
}

