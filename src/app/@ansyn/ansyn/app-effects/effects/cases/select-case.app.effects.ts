import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import {
	SetFavoriteOverlaysAction, SetLayoutAction,
	SetOverlaysCriteriaAction, SetToastMessageAction
} from '@ansyn/core/actions/core.actions';
import {
	BeginLayerCollectionLoadAction,
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, LoadDefaultCaseAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case, CaseMapState } from '@ansyn/core/models/case.model';
import { SetComboBoxesProperties } from '@ansyn/status-bar/actions/status-bar.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { UpdateOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateFacetsAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { selectContextsArray } from '@ansyn/context/reducers/context.reducer';
import { Context } from '@ansyn/core/models/context.model';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { ContextService } from '@ansyn/context/services/context.service';

@Injectable()
export class SelectCaseAppEffects {

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @action ChangeLayoutAction, SetComboBoxesProperties, SetOverlaysCriteriaAction, SetMapsDataActionStore, SetFavoriteOverlaysAction, SetAnnotationsLayer, ToggleDisplayAnnotation
	 */
	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE)
		.mergeMap(({ payload }: SelectCaseAction) => this.selectCaseActions(payload));

	loadDefaultCaseContext$: Observable<any> = this.actions$
		.ofType<LoadDefaultCaseAction>(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => action.payload.context)
		.withLatestFrom(this.store$.select(selectContextsArray))
		.map(([action, contexts]: [LoadDefaultCaseAction, any[]]) => {
			const context = contexts.find(({ id }) => action.payload.context === id);
			return [action, context];
		});

	/**
	 * @type Effect
	 * @name loadExistingDefaultCaseContext$
	 * @ofType LoadDefaultCaseAction
	 * @filter Payload does not have context
	 * @action SelectCaseAction
	 */
	@Effect()
	loadExistingDefaultCaseContext$: Observable<SelectCaseAction> =
		this.loadDefaultCaseContext$
		.filter(([action, context]: [LoadDefaultCaseAction, any]) => Boolean(context))
		.mergeMap(([action, context]: [LoadDefaultCaseAction, any]) => {
			const defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, this.casesService.defaultCase, action.payload);
			return this.getContextTimes(defaultCaseQueryParams, context).map((selectedCase) => {
				return new SelectCaseAction(selectedCase);
			});
		});

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
			return this.contextService.loadContext(action.payload.context)
				.mergeMap((context: Context) => {
					const defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, this.casesService.defaultCase, action.payload);
					return this.getContextTimes(defaultCaseQueryParams, context).map((selectedCase) => {
						return new SelectCaseAction(selectedCase);
					});
				});
		})
		.catch(() => {
			const defaultCaseParams = this.casesService.updateCaseViaQueryParmas({}, this.casesService.defaultCase);
			return Observable.from([new SelectCaseAction(defaultCaseParams),
				new SetToastMessageAction({
					toastText: 'Failed to load context',
					showWarningIcon: true
				})]);
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService,
				protected contextService: ContextService,
				protected overlaysService: OverlaysService) {
	}

	getContextTimes(defaultCaseQueryParams: Case, context: Context): Observable<Case> {
		const updatedCase = { ...defaultCaseQueryParams };
		if (context.imageryCountBefore && !context.imageryCountAfter) {
			return this.overlaysService.getStartDateViaLimitFacets({
				region: updatedCase.state.region,
				limit: this.casesService.contextValues.imageryCountBefore,
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

	selectCaseActions(payload: Case): Action[] {
		const { state } = payload;
		// status-bar
		const { orientation, geoFilter, timeFilter, overlaysManualProcessArgs } = state;
		// map
		const { data, activeMapId } = state.maps;
		// core
		const { favoriteOverlays, time, region } = state;
		const { layout } = state.maps;

		if (typeof time.from === 'string') {
			time.from = new Date(time.from);
		}
		if (typeof time.to === 'string') {
			time.to = new Date(time.to);
		}

		// layers
		const { annotationsLayer, displayAnnotationsLayer } = state.layers;
		// filters
		const { facets } = state;
		return [
			new SetLayoutAction(<any>layout),
			new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
			new SetOverlaysCriteriaAction({ time, region }),
			new SetMapsDataActionStore({ mapsList: data.map(this.parseMapData.bind(this)), activeMapId }),
			new SetFavoriteOverlaysAction(favoriteOverlays.map(this.parseOverlay.bind(this))),
			new BeginLayerCollectionLoadAction(),
			new SetAnnotationsLayer(annotationsLayer),
			new ToggleDisplayAnnotationsLayer(displayAnnotationsLayer),
			new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
			new UpdateFacetsAction(facets)
		];
	}

	parseMapData(map: CaseMapState): CaseMapState {
		if (map.data.overlay) {
			return { ...map, data: { ...map.data, overlay: this.parseOverlay(map.data.overlay) } };
		}
		return map;
	}

	parseOverlay(overlay: Overlay): Overlay {
		return OverlaysService.isFullOverlay(overlay) ? { ...overlay, date: new Date(overlay.date) } : overlay;
	}
}
