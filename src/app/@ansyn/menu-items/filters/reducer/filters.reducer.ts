import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { CaseEnumFilterMetadata, ICaseBooleanFilterMetadata, ICaseFacetsState, ICaseFilter } from '@ansyn/core';
import { IFilter } from '../models/IFilter';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { FiltersActions, FiltersActionTypes } from '../actions/filters.actions';
import { FiltersService } from '../services/filters.service';

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
			const facets = { ...state.facets, filters: action.payload };
			return { ...state, facets, isLoading: false };
		}

		case FiltersActionTypes.INITIALIZE_FILTERS:
			return { ...state, isLoading: true };

		case FiltersActionTypes.UPDATE_FILTER_METADATA: {
			const actionPayload: { filter: IFilter, newMetadata: FilterMetadata } = action.payload;
			const clonedFilters = new Map(state.filters);

			clonedFilters.set(actionPayload.filter, actionPayload.newMetadata);
			const facets = { ...state.facets, filters: <ICaseFilter<ICaseBooleanFilterMetadata | CaseEnumFilterMetadata>[]> FiltersService.buildCaseFilters(clonedFilters, state.facets.filters) };
			return { ...state, filters: clonedFilters, facets };
			// const payload: ICaseFilter[] = action.payload;
			// const cloneFilters: ICaseFilter[] = state.facets.filters.map((caseFilter: ICaseFilter) => {
			// 	if (caseFilter.type === payload.type && caseFilter.fieldName === payload.fieldName) {
			// 		return { ...caseFilter, metadata: payload };
			// 	}
			// 	return { ...caseFilter }
			// });
			// const facets = { ...state.facets, filters: cloneFilters };
			// return { ...state, facets };
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
export const selectShowOnlyFavorites = createSelector(selectFacets, ({ showOnlyFavorites }: ICaseFacetsState) => showOnlyFavorites);
export const selectIsLoading = createSelector(filtersStateSelector, ({ isLoading }) => isLoading);
