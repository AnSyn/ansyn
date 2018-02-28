import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	AddCaseAction,
	AddCasesAction
	CasesActionTypes,
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	SelectCaseByIdAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction,
	SaveCaseAsAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState } from '../reducers/cases.reducer';
import { Case, Context } from '@ansyn/core';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { ICasesConfig } from '../models/cases-config';
import { selectCaseEntities, selectCaseTotal } from '../reducers/cases.reducer';
import { Dictionary } from '@ngrx/entity/src/models';
import { ContextActionTypes } from '@ansyn/context/actions/context.actions';
import { selectContextsArray } from '@ansyn/context/reducers';

@Injectable()
export class CasesEffects {

	/**
	 * @type Effect
	 * @name loadCases$
	 * @ofType LoadCasesAction
	 * @dependencies cases
	 * @action LoadCasesSuccessAction
	 */
	@Effect()
	loadCases$: Observable<AddCasesAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)
		.withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total)
		.switchMap((total: number) => {
			return this.casesService.loadCases(total)
				.map(cases => new AddCasesAction(cases));
		}).share();

	/**
	 * @type Effect
	 * @name onAddCase$
	 * @ofType AddCaseAction
	 * @action SelectCaseAction
	 */
	@Effect()
	onAddCase$: Observable<SelectCaseAction> = this.actions$
		.ofType<AddCaseAction>(CasesActionTypes.ADD_CASE)
		.map((action: AddCaseAction) => new SelectCaseAction(action.payload))
		.share();

	/**
	 * @type Effect
	 * @name onDeleteCase$
	 * @ofType DeleteCaseAction
	 * @dependencies cases
	 * @action LoadDefaultCaseAction?, DeleteCaseBackendAction
	 */
	@Effect()
	onDeleteCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE)
		.withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [state.modalCaseId, state.selectedCase.id])
		.filter(([modalCaseId, selectedCaseId]) => modalCaseId === selectedCaseId)
		.map(() => new LoadDefaultCaseAction());

	// /**
	//  * @type Effect
	//  * @name onDeleteCaseBackend$
	//  * @ofType DeleteCaseBackendAction
	//  * @action DeleteCaseBackendSuccessAction
	//  */
	// @Effect()
	// onDeleteCaseBackend$: Observable<any> = this.actions$
	// 	.ofType<DeleteCaseBackendAction>(CasesActionTypes.DELETE_CASE_BACKEND)
	// 	.map(({ payload }) => payload)
	// 	.switchMap((deletedCaseId) => {
	// 		return this.casesService.removeCase(deletedCaseId)
	// 			.map(() => new DeleteCaseBackendSuccessAction(deletedCaseId));
	// 	}).share();

	/**
	 * @type Effect
	 * @name onDeleteCaseLoadCases$
	 * @ofType DeleteCaseBackendSuccessAction
	 * @dependencies cases
	 * @filter state cases length is not larger than the paginationLimit
	 * @action LoadCasesAction
	 */
	@Effect()
	onDeleteCaseLoadCases$: Observable<LoadCasesAction> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE)
		.withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total)
		.filter((total: number) => total <= this.casesService.paginationLimit)
		.map(() => new LoadCasesAction())
		.share();

	/**
	 * @type Effect
	 * @name onUpdateCase$
	 * @ofType UpdateCaseAction
	 * @dependencies cases
	 * @filter Not the default case
	 * @action UpdateCaseBackendAction
	 */
	@Effect()
	onUpdateCase$: Observable<UpdateCaseBackendAction> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE)
		.withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [action, this.casesService.defaultCase.id])
		.filter(([action, defaultCaseId]: [UpdateCaseAction, string]) => action.payload.id !== defaultCaseId)
		.map(([action]: [UpdateCaseAction]) => new UpdateCaseBackendAction(action.payload))
		.share();

	/**
	 * @type Effect
	 * @name onUpdateCaseBackend$
	 * @ofType UpdateCaseBackendAction
	 * @action UpdateCaseBackendSuccessAction
	 */
	@Effect()
	onUpdateCaseBackend$: Observable<UpdateCaseBackendSuccessAction> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE_BACKEND)
		.switchMap((action: UpdateCaseAction) => {
			return this.casesService.wrapUpdateCase(action.payload).map(updatedCase => {
				return new UpdateCaseBackendSuccessAction(updatedCase);
			});
		}).share();

	/**
	 * @type Effect
	 * @name openModal$
	 * @ofType OpenModalAction
	 */
	@Effect({ dispatch: false })
	openModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.OPEN_MODAL)
		.share();

	/**
	 * @type Effect
	 * @name closeModal$
	 * @ofType CloseModalAction
	 */
	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.CLOSE_MODAL)
		.share();

	/**
	 * @type Effect
	 * @name loadCase$
	 * @ofType LoadCaseAction
	 * @action SelectCaseByIdAction?, SelectCaseAction?, LoadDefaultCaseAction?
	 */
	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE)
		.withLatestFrom(this.store.select(selectCaseEntities))
		.switchMap(([action, entities]: [LoadCaseAction, Dictionary<Case>]) => {
			const existingCase = entities[action.payload];
			if (existingCase) {
				return Observable.of(new SelectCaseAction(existingCase));
			} else {
				return this.casesService.loadCase(action.payload)
					.map((caseValue: Case) => new SelectCaseAction(caseValue))
					.catch(() => Observable.of(new LoadDefaultCaseAction()));
			}
		}).share();

	/**
	 * @type Effect
	 * @name loadDefaultCase$
	 * @ofType LoadDefaultCaseAction
	 * @filter Payload does not have context
	 * @action SelectCaseAction
	 */
	@Effect()
	loadDefaultCase$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => !action.payload.context)
		.map((action: LoadDefaultCaseAction) => {
			const defaultCaseQueryParams: Case = this.casesService.updateCaseViaQueryParmas(action.payload, this.casesService.defaultCase);
			return new SelectCaseAction(defaultCaseQueryParams);
		}).share();

	/**
	 * @type Effect
	 * @name loadDefaultCaseContext$
	 * @ofType LoadDefaultCaseAction
	 * @filter Payload does not have context
	 * @action SelectCaseAction
	 */
	@Effect()
	loadDefaultCaseContext$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => action.payload.context)
		.switchMap((action: LoadDefaultCaseAction) => {
			return this.actions$
				.ofType(ContextActionTypes.ADD_ALL_CONTEXT)
				.withLatestFrom(this.store.select(selectContextsArray), (_, contexts: Context[]) => contexts)
				.map((contexts: Context[]) => {
					const contextName = action.payload.context;
					let defaultCaseQueryParams: Case;
					const context = contexts.find(c => c.name === contextName);
					if (context) {
						defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, this.casesService.defaultCase, action.payload);
					} else {
						defaultCaseQueryParams = this.casesService.updateCaseViaQueryParmas({}, this.casesService.defaultCase);
					}
					return new SelectCaseAction(defaultCaseQueryParams);
				});
		});

	/**
	 * @type Effect
	 * @name onSelectCaseById$
	 * @ofType SelectCaseByIdAction
	 * @dependencies cases
	 * @filter There is a new selected case
	 * @action SelectCaseAction
	 */
	@Effect()
	onSelectCaseById$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store.select(casesStateSelector))
		.map(([{ payload }, casesState]: [SelectCaseByIdAction, ICasesState]): [Case, string] => [
			casesState.entities[payload],
			casesState.selectedCase.id
		])
		.filter(([selectedCase, oldSelectedCaseId]) => Boolean(selectedCase) && selectedCase.id !== oldSelectedCaseId)
		.map(([selectedCase]: [Case, string]) => new SelectCaseAction(selectedCase));

	/**
	 * @type Effect
	 * @name onSaveCaseAs$
	 * @ofType SaveCaseAsAction
	 * @action AddCaseAction
	 */
	@Effect()
	onSaveCaseAs$: Observable<SaveCaseAsSuccessAction> = this.actions$
		.ofType<SaveCaseAsAction>(CasesActionTypes.SAVE_CASE_AS)
		.map(({ payload }) => payload)
		.switchMap((savedCase: Case) => {
			return this.casesService.createCase(savedCase)
				.map((addedCase: Case) => new SaveCaseAsSuccessAction(addedCase));
		});


	constructor(protected actions$: Actions,
				protected casesService: CasesService,
				protected store: Store<ICasesState>,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
	}
}

