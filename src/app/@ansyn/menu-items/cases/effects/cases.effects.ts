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
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	SelectDilutedCaseAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState, selectCaseTotal } from '../reducers/cases.reducer';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { ICasesConfig } from '../models/cases-config';
import { Case } from '@ansyn/core/models/case.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { ContextParams, selectContextsArray } from '@ansyn/context/reducers/context.reducer';
import { Context } from '@ansyn/core/models/context.model';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { ContextService } from '@ansyn/context/services/context.service';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';
import { mergeMap } from 'rxjs/operators';

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
		.withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [state.modal.id, state.selectedCase.id])
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

	/* contexts */
	loadDefaultCaseContext$: Observable<any> = this.actions$
		.ofType<LoadDefaultCaseAction>(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => action.payload.context)
		.withLatestFrom(this.store.select(selectContextsArray))
		.map(([action, contexts]: [LoadDefaultCaseAction, any[]]) => {
			const context = contexts.find(({ id }) => action.payload.context === id);
			return [action, context];
		});

	setContext = mergeMap(([action, context]: [LoadDefaultCaseAction, any]) => {
		const paramsPayload: ContextParams = {};
		if (context.defaultOverlay) {
			paramsPayload.defaultOverlay = context.defaultOverlay;
		}
		if (context.requirements && context.requirements.includes('time')) {
			paramsPayload.time = action.payload.time;
		}
		const defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, this.casesService.defaultCase, action.payload);
		return this.getContextTimes(defaultCaseQueryParams, context)
			.mergeMap((selectedCase) => [
					new SetContextParamsAction(paramsPayload),
					new SelectCaseAction(selectedCase)
				]
			);
	});

	/**
	 * @type Effect
	 * @name loadExistingDefaultCaseContext$
	 * @ofType LoadDefaultCaseAction
	 * @filter Payload does not have context
	 * @action SelectCaseAction
	 */
	@Effect()
	loadExistingDefaultCaseContext$: Observable<SetContextParamsAction | SelectCaseAction> =
		this.loadDefaultCaseContext$
			.filter(([action, context]: [LoadDefaultCaseAction, any]) => Boolean(context))
			.pipe(this.setContext);

	/**
	 * @type Effect
	 * @name loadExistingDefaultCaseContext$
	 * @ofType LoadDefaultCaseAction
	 * @filter Payload does not have context
	 * @action SelectCaseAction
	 */
	@Effect()
	loadNotExistingDefaultCaseContext$: Observable<any> =
		this.loadDefaultCaseContext$
			.filter(([action, context]: [LoadDefaultCaseAction, any]) => !(Boolean(context)))
			.mergeMap(([action, context]: [LoadDefaultCaseAction, any]) => {
				return this.contextService
					.loadContext(action.payload.context)
					.map((context: Context) => [action, context])
					.pipe(this.setContext)
			})
			.catch(() => {
				const defaultCaseParams = this.casesService.updateCaseViaQueryParmas({}, this.casesService.defaultCase);
				return Observable.from([new SelectCaseAction(defaultCaseParams),
					new SetToastMessageAction({
						toastText: 'Failed to load context',
						showWarningIcon: true
					})]);
			});


	/**
	 * @type Effect
	 * @name onCopyShareCaseLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is true
	 * @action SetToastMessageAction
	 * @dependencies cases
	 */
	@Effect()
	onCopyShareCaseLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => Boolean(action.payload.shareCaseAsQueryParams))
		.withLatestFrom(this.store.select(casesStateSelector), (action: CopyCaseLinkAction, state: ICasesState) => {
			let sCase = state.entities[action.payload.caseId];
			if (!sCase) {
				if (state.selectedCase.id === action.payload.caseId) {
					sCase = state.selectedCase;
				}
			}
			return sCase;
		})
		.map((sCase: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
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
		.withLatestFrom(this.store.select(casesStateSelector))
		.filter(([action, casesState]: [LoadDefaultCaseAction, ICasesState]) => !Boolean(casesState.selectedCase))
		.map(() => new LoadDefaultCaseAction());

	/**
	 * @type Effect
	 * @name loadCase$
	 * @ofType LoadCaseAction
	 * @action SelectCaseAction?, SetToastMessageAction?, LoadDefaultCaseIfNoActiveCaseAction?
	 */
	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE)
		.switchMap((action: LoadCaseAction) => this.casesService.loadCase(action.payload))
		.map((dilutedCase) => new SelectDilutedCaseAction(dilutedCase));

	getContextTimes(defaultCaseQueryParams: Case, context: Context): Observable<Case> {
		const updatedCase = { ...defaultCaseQueryParams };
		if (context.imageryCountBefore && !context.imageryCountAfter) {
			return this.overlaysService.getStartDateViaLimitFacets({
				region: updatedCase.state.region,
				limit: context.imageryCountBefore,
				facets: updatedCase.state.facets
			})
				.map(({ startDate, endDate }: StartAndEndDate) => {
					if (!updatedCase.state.time) {
						updatedCase.state.time = { ...CasesService.defaultTime };
					}
					updatedCase.state.time.from = new Date(startDate);
					updatedCase.state.time.to = new Date(endDate);
					return updatedCase;
				});
		}
		return Observable.of(updatedCase);
	}

	constructor(protected actions$: Actions,
				protected casesService: CasesService,
				protected contextService: ContextService,
				protected overlaysService: OverlaysService,
				protected store: Store<ICasesState>,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
	}
}

