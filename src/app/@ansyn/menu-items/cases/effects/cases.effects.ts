import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	AddCaseAction,
	AddCasesAction,
	CasesActionTypes,
	CopyCaseLinkAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState, selectCaseTotal } from '../reducers/cases.reducer';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { ICasesConfig } from '../models/cases-config';
import { CasePreview } from '@ansyn/core/models/case.model';
import { SelectCaseAction } from '@ansyn/core/actions/core.actions';
import { Case } from '@ansyn/core/models/case.model';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { selectSelectedCase } from '@ansyn/core/reducers/core.reducer';

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
	loadCases$: Observable<AddCasesAction | {}> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)
		.withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total)
		.switchMap((total: number) => {
			return this.casesService.loadCases(total)
				.map(cases => new AddCasesAction(cases))
				.catch(() => Observable.empty());
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
		.withLatestFrom(this.store.select(casesStateSelector), this.store.select(selectSelectedCase), (action, state: ICasesState, selectedCase: CasePreview) => [state.modal.id, selectedCase.id])
		.filter(([modalCaseId, selectedCaseId]) => modalCaseId === selectedCaseId)
		.map(() => new LoadDefaultCaseAction());

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

	/**
	 * @type Effect
	 * @name onCopyShareCaseIdLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is false
	 * @action SetToastMessageAction
	 */
	@Effect()
	onCopyShareCaseIdLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => !Boolean(action.payload.shareCaseAsQueryParams))
		.map((action) => {
			const shareLink = this.casesService.generateLinkWithCaseId(action.payload.caseId);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		});

	/**
	 * @type Effect
	 * @name loadDefaultCaseIfNoActiveCase$
	 * @ofType LoadDefaultCaseIfNoActiveCaseAction
	 */
	@Effect()
	loadDefaultCaseIfNoActiveCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE)
		.withLatestFrom(this.store.select(casesStateSelector), this.store.select(selectSelectedCase))
		.filter(([action, casesState, selectedCase]: [LoadDefaultCaseAction, ICasesState, CasePreview]) => !Boolean(selectedCase))
		.map(() => new LoadDefaultCaseAction());

	constructor(protected actions$: Actions,
				protected casesService: CasesService,
				protected store: Store<ICasesState>,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
	}
}

