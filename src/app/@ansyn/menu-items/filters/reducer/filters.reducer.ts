import { IFilter } from '@ansyn/menu-items/filters/models/IFilter';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { FiltersActions, FiltersActionTypes } from '@ansyn/menu-items/filters/actions/filters.actions';
import { ICaseFacetsState, ICaseFilter } from '@ansyn/core/models/case.model';
import { FiltersService } from '@ansyn/menu-items/filters/services/filters.service';

export type Filters = Map<IFilter, FilterMetadata>;

export interface IFiltersState {
	filters: Filters;
	oldFilters: Map<IFilter, FilterMetadata>;
	isLoading: boolean;
	facets: ICaseFacetsState;
	enableOnlyFavoritesSelection: boolean;
}

export const initialFiltersState: IFiltersState = {
	filters: new Map<IFilter, FilterMetadata>(),
	oldFilters: null,
	isLoading: true,
	facets: {
		showOnlyFavorites: false,
		filters: []
	},
	enableOnlyFavoritesSelection: false
};

export const filtersFeatureKey = 'filters';

export const filtersStateSelector: MemoizedSelector<any, IFiltersState> = createFeatureSelector<IFiltersState>(filtersFeatureKey);

export function FiltersReducer(state: IFiltersState = initialFiltersState, action: FiltersActions) {
	switch (action.type) {

		case FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS: {
			const filters = action.payload;
			const facets = { ...state.facets, filters: <ICaseFilter[]> FiltersService.buildCaseFilters(filters) };
			return { ...state, filters, facets, isLoading: false };
		}

		case FiltersActionTypes.INITIALIZE_FILTERS:
			return { ...state, isLoading: true };

		case FiltersActionTypes.UPDATE_FILTER_METADATA: {
			const actionPayload: { filter: IFilter, newMetadata: FilterMetadata } = action.payload;
			const clonedFilters = new Map(state.filters);

			clonedFilters.set(actionPayload.filter, actionPayload.newMetadata);
			const facets = { ...state.facets, filters: <ICaseFilter[]> FiltersService.buildCaseFilters(clonedFilters) };
			return { ...state, filters: clonedFilters, facets };
		}

		case FiltersActionTypes.RESET_FILTERS: {
			return {
				...state,
				oldFilters: state.filters,
				filters: new Map<IFilter, FilterMetadata>(),
				isLoading: true
			};
		}

		case FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION:
			return Object.assign({}, state, { enableOnlyFavoritesSelection: action.payload });

		case FiltersActionTypes.UPDATE_FACETS:
			return { ...state, facets: { ...state.facets, ...action.payload } };

		default:
			return state;
	}
}

export const selectFilters = createSelector(filtersStateSelector, ({ filters }) => filters);
export const selectOldFilters = createSelector(filtersStateSelector, ({ oldFilters }) => oldFilters);
export const selectFacets = createSelector(filtersStateSelector, ({ facets }) => facets);
export const selectShowOnlyFavorites = createSelector(selectFacets, ({ showOnlyFavorites }: ICaseFacetsState) => showOnlyFavorites);
