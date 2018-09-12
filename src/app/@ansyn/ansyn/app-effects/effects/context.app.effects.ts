import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IContextParams, selectContextsArray, selectContextsParams, SetContextParamsAction, ContextService } from '@ansyn/context';
import {
	CasesActionTypes,
	LoadDefaultCaseAction,
	SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetToastMessageAction } from '@ansyn/core';
import { IContext } from '@ansyn/core';
import { ICase } from '@ansyn/core';
import { IStartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

@Injectable()
export class ContextAppEffects {

	loadDefaultCaseContext$: Observable<any> = this.actions$.pipe(
		ofType<LoadDefaultCaseAction>(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => action.payload.context),
		withLatestFrom(this.store.select(selectContextsArray), this.store.select(selectContextsParams)),
		map(([action, contexts, params]: [LoadDefaultCaseAction, any[], IContextParams]) => {
			const context = contexts.find(({ id }) => action.payload.context === id);
			return [action, context, params];
		})
	);

	setContext: any = mergeMap(([action, context, contextParams]: [LoadDefaultCaseAction, IContext, IContextParams]) => {
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

	@Effect()
	loadExistingDefaultCaseContext$: Observable<SetContextParamsAction | SelectCaseAction> =
		this.loadDefaultCaseContext$
			.filter(([action, context]: [LoadDefaultCaseAction, any, IContextParams]) => Boolean(context))
			.pipe(this.setContext);

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
