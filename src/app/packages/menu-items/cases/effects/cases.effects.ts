import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
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
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	SelectCaseByIdAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState } from '../reducers/cases.reducer';
import { Case } from '@ansyn/core';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { ICasesConfig } from '../models/cases-config';
import { SaveCaseAsAction } from '@ansyn/menu-items';


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
	loadCases$: Observable<LoadCasesSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)
		.withLatestFrom(this.store.select(casesStateSelector))
		.switchMap(([action, casesState]: [LoadCasesAction, ICasesState]) => {
			return this.casesService.loadCases(casesState.cases.length)
				.map(newCases => {
					return new LoadCasesSuccessAction(newCases);
				});
		}).share();

	/**
	 * @type Effect
	 * @name onAddCase$
	 * @ofType AddCaseAction
	 * @action AddCaseSuccessAction
	 */
	@Effect()
	onAddCase$: Observable<AddCaseSuccessAction> = this.actions$
		.ofType<AddCaseAction>(CasesActionTypes.ADD_CASE)
		.switchMap((action) => {
			return this.casesService.createCase(action.payload)
				.map((addedCase: Case) => {
					return new AddCaseSuccessAction(addedCase);
				});
		}).share();

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
		.mergeMap(([modalCaseId, selectedCaseId]) => {
			const actions: Action[] = [];
			if (modalCaseId === selectedCaseId) {
				actions.push(new LoadDefaultCaseAction());
			}
			actions.push(new DeleteCaseBackendAction(modalCaseId));
			return actions;
		}).share();

	/**
	 * @type Effect
	 * @name onDeleteCaseBackend$
	 * @ofType DeleteCaseBackendAction
	 * @action DeleteCaseBackendSuccessAction
	 */
	@Effect()
	onDeleteCaseBackend$: Observable<any> = this.actions$
		.ofType<DeleteCaseBackendAction>(CasesActionTypes.DELETE_CASE_BACKEND)
		.map(({ payload }) => payload)
		.switchMap((deletedCaseId) => {
			return this.casesService.removeCase(deletedCaseId)
				.map(() => new DeleteCaseBackendSuccessAction(deletedCaseId));
		}).share();

	/**
	 * @type Effect
	 * @name onDeleteCaseBackendSuccess$
	 * @ofType DeleteCaseBackendSuccessAction
	 * @dependencies cases
	 * @filter state cases length is not larger than the paginationLimit
	 * @action LoadCasesAction
	 */
	@Effect()
	onDeleteCaseBackendSuccess$: Observable<LoadCasesAction> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE_BACKEND_SUCCESS)
		.withLatestFrom(this.store.select(casesStateSelector))
		.filter(([action, state]: [DeleteCaseBackendSuccessAction, ICasesState]) => {
			const casesLength = state.cases.length;
			const limit = this.casesService.paginationLimit;
			return casesLength <= limit;
		})
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
		.withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [action, CasesService.defaultCase.id])
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
	 * @name onUpdateCaseBackendSuccess$
	 * @ofType UpdateCaseBackendSuccessAction
	 */
	@Effect({ dispatch: false })
	onUpdateCaseBackendSuccess$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS)
		.share();

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
	 * @name addCaseSuccess$
	 * @ofType AddCaseSuccessAction
	 * @action SelectCaseByIdAction
	 */
	@Effect()
	addCaseSuccess$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.ADD_CASE_SUCCESS)
		.map((action: AddCaseSuccessAction) => new SelectCaseAction(action.payload))
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
		.withLatestFrom(this.store.select(casesStateSelector))
		.switchMap(([action, state]: [LoadCaseAction, ICasesState]) => {
			const existingCase = state.cases.find(caseVal => caseVal.id === action.payload);
			if (existingCase) {
				return Observable.of(new SelectCaseByIdAction(existingCase.id) as any);
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
			const defaultCaseQueryParams: Case = this.casesService.updateCaseViaQueryParmas(action.payload, CasesService.defaultCase);
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
				.ofType(CasesActionTypes.LOAD_CONTEXTS_SUCCESS)
				.withLatestFrom(this.store.select(casesStateSelector), (_, cases) => cases)
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
			casesState.cases.find(({ id }) => id === payload),
			casesState.selectedCase.id
		])
		.filter(([selectedCase, oldSelectedCaseId]) => Boolean(selectedCase) && selectedCase.id !== oldSelectedCaseId)
		.map(([selectedCase, oldSelectedCaseId]: [Case, string]) => new SelectCaseAction(selectedCase));

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

