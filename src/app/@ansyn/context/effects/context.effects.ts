import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IContextParams, selectContextsArray, selectContextsParams } from '@ansyn/context/reducers/context.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	CasesActionTypes,
	CopyCaseLinkAction,
	LoadDefaultCaseAction,
	SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';
import { IContext } from '@ansyn/core/models/context.model';
import { ICase } from '@ansyn/core/models/case.model';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { IStartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { ContextService } from '@ansyn/context/services/context.service';
import { Store } from '@ngrx/store';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

@Injectable()
export class ContextEffects {

	loadDefaultCaseContext$: Observable<any> = this.actions$.pipe(
		ofType<LoadDefaultCaseAction>(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => action.payload.context),
		withLatestFrom(this.store.select(selectContextsArray), this.store.select(selectContextsParams)),
		map(([action, contexts, params]: [LoadDefaultCaseAction, any[], IContextParams]) => {
			const context = contexts.find(({ id }) => action.payload.context === id);
			return [action, context, params];
		})
	);

	setContext = mergeMap(([action, context, contextParams]: [LoadDefaultCaseAction, IContext, IContextParams]) => {
		const paramsPayload: IContextParams = {};
		if (context.defaultOverlay) {
			paramsPayload.defaultOverlay = context.defaultOverlay;
		}
		if (context.requirements && context.requirements.includes('time')) {
			paramsPayload.time = action.payload.time;
		}
		const defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, this.casesService.defaultCase, action.payload);
		return this.getCaseForContext(defaultCaseQueryParams, context, paramsPayload)
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
			.filter(([action, context]: [LoadDefaultCaseAction, any, IContextParams]) => Boolean(context))
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
		this.loadDefaultCaseContext$.pipe(
			filter(([action, context]: [LoadDefaultCaseAction, any, IContextParams]) => !(Boolean(context))),
			mergeMap(([action, context, params]: [LoadDefaultCaseAction, IContext, IContextParams]) => {
				return this.contextService
					.loadContext(action.payload.context)
					.map((context: IContext) => [action, context, params])
					.pipe(this.setContext);
			}),
			catchError((err) => {
				console.warn('Error loading context as case', err);
				const defaultCaseParams = this.casesService.updateCaseViaQueryParmas({}, this.casesService.defaultCase);
				return Observable.from([new SelectCaseAction(defaultCaseParams),
					new SetToastMessageAction({
						toastText: 'Failed to load context',
						showWarningIcon: true
					})]);
			})
		);


	/**
	 * @type Effect
	 * @name onCopyShareCaseLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is true
	 * @action SetToastMessageAction
	 * @dependencies cases
	 */
	@Effect()
	onCopyShareCaseLink$ = this.actions$.pipe(
		ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK),
		filter(action => Boolean(action.payload.shareCaseAsQueryParams)),
		withLatestFrom(this.store.select(casesStateSelector), (action: CopyCaseLinkAction, state: ICasesState) => {
			let sCase = state.entities[action.payload.caseId];
			if (!sCase) {
				if (state.selectedCase.id === action.payload.caseId) {
					sCase = state.selectedCase;
				}
			}
			return sCase;
		}),
		map((sCase: ICase) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		})
	);

	constructor(protected actions$: Actions,
				protected store: Store<any>,
				protected casesService: CasesService,
				protected overlaysService: OverlaysService,
				protected contextService: ContextService) {

	}

	getCaseForContext(defaultCaseQueryParams: ICase, context: IContext, params: IContextParams): Observable<ICase> {
		const updatedCase = { ...defaultCaseQueryParams };

		const mapToCase = map(({ startDate, endDate }: IStartAndEndDate): ICase => ({
				...updatedCase,
				state: {
					...updatedCase.state,
					time: {
						type: 'absolute',
						from: new Date(startDate),
						to: new Date(endDate)
					}
				}
			}
		));

		let case$: Observable<ICase> = Observable.of(defaultCaseQueryParams).pipe(<any>mapToCase);

		if (context.imageryCountBefore && !context.imageryCountAfter) {
			case$ = <any> this.overlaysService.getStartDateViaLimitFacets({
				region: updatedCase.state.region,
				limit: context.imageryCountBefore,
				facets: updatedCase.state.facets
			}).pipe(mapToCase);
		} else if (context.imageryCountBefore && context.imageryCountAfter) {
			case$ = this.overlaysService.getStartAndEndDateViaRangeFacets({
				region: updatedCase.state.region,
				limitBefore: context.imageryCountBefore,
				limitAfter: context.imageryCountAfter,
				facets: updatedCase.state.facets,
				date: params.time
			}).pipe(mapToCase);
		}
		return case$;
	}

}
