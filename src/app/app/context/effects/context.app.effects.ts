import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { CasesActionTypes, CasesService, LoadDefaultCaseAction, SelectCaseAction } from '@ansyn/menu-items';
import {
	DisplayedOverlay,
	ICase,
	IContext,
	IContextEntity,
	IOverlaySpecialObject,
	SetToastMessageAction
} from '@ansyn/core';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayFromStoreAction,
	IOverlaysState,
	IStartAndEndDate,
	OverlaysActionTypes,
	OverlaysService,
	overlaysStateSelector,
	SetFilteredOverlaysAction, SetSpecialObjectsActionStore
} from '@ansyn/overlays';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, filter, map, mergeMap, withLatestFrom, share } from 'rxjs/operators';
import { Store, Action } from '@ngrx/store';
import {
	IContextParams,
	selectContextEntities,
	selectContextsArray,
	selectContextsParams
} from '../reducers/context.reducer';
import { SetContextParamsAction } from '../actions/context.actions';
import { ContextService } from '../services/context.service';
import { get } from 'lodash';
import { transformScale } from '@turf/turf';

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
		return this.getCaseForContext(defaultCaseQueryParams, context, paramsPayload).pipe(
			mergeMap((selectedCase) => [
					new SetContextParamsAction(paramsPayload),
					new SelectCaseAction(selectedCase)
				]
		));
	});

	@Effect()
	loadExistingDefaultCaseContext$: Observable<SetContextParamsAction | SelectCaseAction> =
		this.loadDefaultCaseContext$
			.pipe(
				filter(([action, context]: [LoadDefaultCaseAction, any, IContextParams]) => Boolean(context)),
				this.setContext
			);

	@Effect()
	loadNotExistingDefaultCaseContext$: Observable<any> =
		this.loadDefaultCaseContext$.pipe(
			filter(([action, context]: [LoadDefaultCaseAction, any, IContextParams]) => !(Boolean(context))),
			mergeMap(([action, context, params]: [LoadDefaultCaseAction, IContext, IContextParams]) => {
				return this.contextService
					.loadContext(action.payload.context)
					.pipe(
						map((context: IContext) => [action, context, params]),
						this.setContext
					);
			}),
			catchError((err) => {
				console.warn('Error loading context as case', err);
				const defaultCaseParams = this.casesService.updateCaseViaQueryParmas({}, this.casesService.defaultCase);
				return from([new SelectCaseAction(defaultCaseParams),
					new SetToastMessageAction({
						toastText: 'Failed to load context',
						showWarningIcon: true
					})]);
			})
		);

	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$.pipe(
		ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS),
		withLatestFrom(this.store.select(selectContextsParams), this.store.select(overlaysStateSelector)),
		filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.latest && filteredOverlays.length > 0),
		mergeMap(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => {
			const id = filteredOverlays[filteredOverlays.length - 1];
			return [
				new SetContextParamsAction({ defaultOverlay: null }),
				new DisplayOverlayFromStoreAction({ id })
			];
		}),
		share()
	);

	@Effect()
	displayTwoNearestOverlay$: Observable<any> = this.actions$.pipe(
		ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS),
		withLatestFrom(this.store.select(selectContextsParams), this.store.select(overlaysStateSelector)),
		filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.nearest && filteredOverlays.length > 0),
		mergeMap(([action, params, { entities: overlays, filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => {
			const overlaysBeforeId = [...filteredOverlays].reverse().find(overlayId => overlays[overlayId].photoTime < params.time);
			const overlaysBefore = overlays[overlaysBeforeId];
			const overlaysAfterId = filteredOverlays.find(overlayId => overlays[overlayId].photoTime > params.time);
			const overlaysAfter = overlays[overlaysAfterId];
			const featureJson = get(params, 'contextEntities[0].featureJson');
			let extent;
			if (featureJson) {
				const featureJsonScale = transformScale(featureJson, 1.1);
				if (featureJsonScale.geometry.type !== 'Point') {
					extent = bbox(featureJsonScale);
				}
			}
			const payload = [{ overlay: overlaysBefore, extent }, {
				overlay: overlaysAfter,
				extent
			}].filter(({ overlay }) => Boolean(overlay));
			return [
				new DisplayMultipleOverlaysFromStoreAction(payload),
				new SetContextParamsAction({ defaultOverlay: null })
			];
		}),
		share()
	);

	@Effect()
	setSpecialObjectsFromContextEntities$: Observable<any> = this.store.select(selectContextEntities).pipe(
		filter((contextEntities: IContextEntity[]) => Boolean(contextEntities)),
		map((contextEntities: IContextEntity[]): Action => {
			const specialObjects = contextEntities.map(contextEntity => ({
				id: contextEntity.id,
				date: contextEntity.date,
				shape: 'star'
			} as IOverlaySpecialObject));
			return new SetSpecialObjectsActionStore(specialObjects);
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

		let case$: Observable<ICase> = of(defaultCaseQueryParams).pipe(<any>mapToCase);

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
