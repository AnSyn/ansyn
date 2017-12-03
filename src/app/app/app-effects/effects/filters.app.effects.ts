import { cloneDeep, isEmpty, isNil } from 'lodash';
import { Case, ICasesState, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Overlay, OverlaysActionTypes } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app.effects.module';
import { Filter, FilterMetadata, InitializeFiltersAction, ResetFiltersAction } from '@ansyn/menu-items/filters';
import { filtersStateSelector, IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { SetFiltersAction } from '@ansyn/overlays/actions/overlays.actions';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { InitializeFiltersSuccessAction, UpdateFilterAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { facetChangesActionType } from '@ansyn/menu-items/filters/effects/filters.effects';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { LoadOverlaysAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';

@Injectable()
export class FiltersAppEffects {

	/**
	 * @type Effect
	 * @name updateOverlayFilters$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction, SyncFilteredOverlays
	 * @action SetFiltersAction
	 * @dependencies filters, cases
	 */
	@Effect()
	updateOverlayFilters$: Observable<SetFiltersAction> = this.actions$
		.ofType(...facetChangesActionType, OverlaysActionTypes.SYNC_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(casesStateSelector))
		.map(([action, filtersState, casesState]: [InitializeFiltersSuccessAction | UpdateFilterAction | ResetFiltersAction, IFiltersState, ICasesState]) => {
			const parsedFilters = Array.from(filtersState.filters)
				.map(([key, value]) => ({
					filteringParams: {
						key: key.modelName,
						metadata: value
					},
					filterFunc: value.filterFunc
				}));

			const favorites = casesState.selectedCase.state.favoritesOverlays;

			return new SetFiltersAction({
				parsedFilters,
				showOnlyFavorites: filtersState.showOnlyFavorites,
				favorites
			});
		});

	/**
	 * @type Effect
	 * @name updateCaseFacets$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction, SyncFilteredOverlays
	 * @action UpdateCaseAction
	 * @dependencies filters, cases
	 */
	@Effect()
	updateCaseFacets$: Observable<UpdateCaseAction> = this.actions$
		.ofType(...facetChangesActionType, OverlaysActionTypes.SYNC_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(casesStateSelector).pluck('selectedCase'))
		.map(([action, filtersState, selectedCase]: [Action, IFiltersState, Case]) => this.updateCaseFacets(selectedCase, filtersState))
		.map(updatedCase => new UpdateCaseAction(updatedCase));

	/**
	 * @type Effect
	 * @name initializeFilters$
	 * @ofType LoadOverlaysSuccessAction
	 * @dependencies cases, overlays
	 * @action InitializeFiltersAction
	 */
	@Effect()
	initializeFilters$: Observable<any> = this.actions$
		.ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), this.store$.select(overlaysStateSelector), (action: any, selectedCase: Case, overlaysState: IOverlaysState): any => {
			const overlaysArray: Overlay[] = Array.from(overlaysState.overlays.values());
			return [overlaysArray, selectedCase.state.facets];
		})
		.map(([overlays, facets]: [Overlay[], any]) => new InitializeFiltersAction({ overlays, facets }));

	/**
	 * @type Effect
	 * @name resetFilters$
	 * @ofType LoadOverlaysAction
	 * @action ResetFiltersAction
	 */
	@Effect()
	resetFilters$: Observable<ResetFiltersAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new ResetFiltersAction());

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}

	updateCaseFacets(selectedCase: Case, filtersState: IFiltersState): Case {
		const cloneSelectedCase: Case = cloneDeep(selectedCase);
		const { facets } = cloneSelectedCase.state;
		facets.showOnlyFavorites = filtersState.showOnlyFavorites;
		facets.filters = [];
		filtersState.filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
			const currentFilter: any = facets.filters.find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

			if (!currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				facets.filters.push({ fieldName, metadata });
			}
			else if (currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			}
			else if (currentFilter && this.isMetadataEmpty(outerStateMetadata)) {
				const index = facets.filters.indexOf(currentFilter);
				facets.filters.splice(index, 1);
			}
		});

		return cloneSelectedCase;
	}

	isMetadataEmpty(metadata: any): boolean {
		return isNil(metadata); // || (Array.isArray(metadata) && isEmpty(metadata));
	}
}
