import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { ICaseFacetsState, ICaseFilter } from '@ansyn/core';
import { IFilter } from '../models/IFilter';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { FiltersActions, FiltersActionTypes } from '../actions/filters.actions';
import { OverlaysActionTypes } from '@ansyn/overlays';

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
		case OverlaysActionTypes.LOAD_OVERLAYS:
			return { ...state, isLoading: true };

		case OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS:
			return { ...state, isLoading: false };


		case FiltersActionTypes.UPDATE_FILTER_METADATA: {
			const actionPayload: ICaseFilter = action.payload;
			const filters = [...state.facets.filters];

			const caseFilter = state.facets
				.filters.find(({ fieldName, type }: ICaseFilter) => fieldName === actionPayload.fieldName && actionPayload.type === type);

			if (caseFilter) {
				caseFilter.metadata = actionPayload.metadata;
			} else {
				filters.push(actionPayload);
			}

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
export const selectIsFiltersLoading = createSelector(filtersStateSelector, ({ isLoading }) => isLoading);
