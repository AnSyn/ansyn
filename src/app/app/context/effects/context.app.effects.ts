import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import {
	CasesActionTypes,
	CasesService,
	DisplayedOverlay,
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayFromStoreAction,
	ICase,
	IContext,
	IContextEntity,
	IOverlaySpecialObject,
	IOverlaysState,
	IStartAndEndDate,
	LoadDefaultCaseAction,
	OverlaysActionTypes,
	OverlaysService,
	overlaysStateSelector,
	SelectCaseAction,
	SetFilteredOverlaysAction,
	SetSpecialObjectsActionStore
} from '@ansyn/ansyn';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { catchError, filter, map, mergeMap, share, withLatestFrom } from 'rxjs/operators';
import { Action, Store } from '@ngrx/store';
import {
	IContextParams,
	selectContextEntities,
	selectContextsArray,
	selectContextsParams
} from '../reducers/context.reducer';
import { SetContextParamsAction } from '../actions/context.actions';
import { ContextService } from '../services/context.service';
import { get } from 'lodash';
import { bbox, transformScale } from '@turf/turf';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { Params } from '@angular/router';

@Injectable()
export class ContextAppEffects {

	loadDefaultCaseContext$ = this.actions$.pipe(
		ofType(LoadDefaultCaseAction),
		filter(payload => payload.payload.context),
		withLatestFrom(this.store.select(selectContextsArray), this.store.select(selectContextsParams)),
		map(([payload, contexts, params]: [{payload: Params}, any[], IContextParams]) => {
			const context = contexts.find(({ id }) => payload.payload.context === id);
			return [payload, context, params];
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
					SetContextParamsAction({payload: paramsPayload}),
					SelectCaseAction(selectedCase)
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
				return from([SelectCaseAction(defaultCaseParams),
					SetToastMessageAction({
						toastText: 'Failed to load context',
						showWarningIcon: true
					})]);
			})
		);

	displayLatestOverlay$ = createEffect(() => this.actions$.pipe(
		ofType(SetFilteredOverlaysAction),
		withLatestFrom(this.store.select(selectContextsParams), this.store.select(overlaysStateSelector)),
		filter(([, params, { filteredOverlays }]: [any, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.latest && filteredOverlays.length > 0),
		mergeMap(([, params, { filteredOverlays }]: [any, IContextParams, IOverlaysState]) => {
			const id = filteredOverlays[filteredOverlays.length - 1];
			return [
				SetContextParamsAction({ defaultOverlay: null }),
				DisplayOverlayFromStoreAction({ id })
			];
		}),
		share()
	));

	displayTwoNearestOverlay$: Observable<any> = createEffect(() => this.actions$.pipe(
		ofType(SetFilteredOverlaysAction),
		withLatestFrom(this.store.select(selectContextsParams), this.store.select(overlaysStateSelector)),
		filter(([, params, { filteredOverlays }]: [{payload: string[]}, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.nearest && filteredOverlays.length > 0),
		mergeMap(([, params, { entities: overlays, filteredOverlays }]: [{payload: string[]}, IContextParams, IOverlaysState]) => {
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
				DisplayMultipleOverlaysFromStoreAction(payload),
				SetContextParamsAction({ defaultOverlay: null })
			];
		}),
		share()
	));

	setSpecialObjectsFromContextEntities$  = createEffect(() => this.store.select(selectContextEntities).pipe(
		filter((contextEntities: IContextEntity[]) => Boolean(contextEntities)),
		map((contextEntities: IContextEntity[]): Action => {
			const specialObjects = contextEntities.map(contextEntity => ({
				id: contextEntity.id,
				date: contextEntity.date,
				shape: 'star'
			} as IOverlaySpecialObject));
			return SetSpecialObjectsActionStore({payload: specialObjects});
		}))
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
			case$ = <any>this.overlaysService.getStartDateViaLimitFacets({
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
