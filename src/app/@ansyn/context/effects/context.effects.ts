import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ContextParams, selectContextsArray } from '@ansyn/context/reducers/context.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	CasesActionTypes, CopyCaseLinkAction,
	LoadCaseAction, LoadDefaultCaseAction, SelectCaseAction,
	SelectDilutedCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';
import { Context } from '@ansyn/core/models/context.model';
import { Case } from '@ansyn/core/models/case.model';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Actions, Effect } from '@ngrx/effects';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { mergeMap } from 'rxjs/operators';
import { ContextService } from '@ansyn/context/services/context.service';
import { Store } from '@ngrx/store';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { SetSpecialObjectsActionStore } from '@ansyn/overlays/actions/overlays.actions';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';

@Injectable()
export class ContextEffects {

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
	 * @name loadCase$
	 * @ofType LoadCaseAction
	 * @action SelectCaseAction?, SetToastMessageAction?, LoadDefaultCaseIfNoActiveCaseAction?
	 */
	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE)
		.switchMap((action: LoadCaseAction) => this.casesService.loadCase(action.payload))
		.map((dilutedCase) => new SelectDilutedCaseAction(dilutedCase));

	@Effect()
	setSpecialObjectsFromSelectedCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => Boolean(payload.state.contextEntities))
		.mergeMap(({ payload }: SelectCaseAction): any => (
			payload.state.contextEntities.map(contextEntity => {
				const specialObject: OverlaySpecialObject = {
					id: contextEntity.id,
					date: contextEntity.date,
					shape: 'star'
				} as OverlaySpecialObject;
				return new SetSpecialObjectsActionStore([specialObject]);
			})));

	constructor(protected actions$: Actions,
				protected store: Store<any>,
				protected casesService: CasesService,
				protected overlaysService: OverlaysService,
				protected contextService: ContextService) {

	}

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

}
