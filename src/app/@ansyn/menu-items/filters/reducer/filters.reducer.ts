import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { ICaseFacetsState } from '@ansyn/core';
import { IFilter } from '../models/IFilter';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { FiltersActions, FiltersActionTypes } from '../actions/filters.actions';
import { ICaseFilter } from '../../../core/models/case.model';

export type Filters = Map<IFilter, FilterMetadata>;

export interface IFiltersState {
	isLoading: boolean;
	facets: ICaseFacetsState;
	enableOnlyFavoritesSelection: boolean;
}

export const initialFiltersState: IFiltersState = {
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
			const facets = { ...state.facets, filters: action.payload.filters };
			return { ...state, isLoading: false, facets };
		}

		case FiltersActionTypes.INITIALIZE_FILTERS:
			return { ...state, isLoading: true };

		case FiltersActionTypes.UPDATE_FILTER_METADATA: {
			const actionPayload: ICaseFilter = action.payload;
			const filters = state.facets.filters.map((filter) => {
				if (filter.type === actionPayload.type && filter.fieldName === actionPayload.fieldName) {
					return { ...actionPayload };
				}
				return filter;
			});
			return { ...state, facets: { ...state.facets, filters } };
		}

		case FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION:
			return Object.assign({}, state, { enableOnlyFavoritesSelection: action.payload });

		case FiltersActionTypes.UPDATE_FACETS:
			return { ...state, facets: { ...state.facets, ...action.payload } };

		default:
			return state;
	}
}

export const selectFacets = createSelector(filtersStateSelector, ({ facets }) => facets);
export const selectFilters = createSelector(selectFacets, ({ filters }: ICaseFacetsState): ICaseFilter[] => filters);
export const selectShowOnlyFavorites = createSelector(selectFacets, ({ showOnlyFavorites }: ICaseFacetsState) => showOnlyFavorites);
export const selectIsLoading = createSelector(filtersStateSelector, ({ isLoading }) => isLoading);
