import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IFilter } from '../models/IFilter';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { FiltersActions, FiltersActionTypes } from '../actions/filters.actions';
import { FiltersService } from '../services/filters.service';
import {
	ICaseBooleanFilterMetadata,
	ICaseEnumFilterMetadata,
	ICaseFacetsState,
	ICaseFilter,
	ICaseSliderFilterMetadata
} from '../../cases/models/case.model';
import { IFilterSearchResults } from '../models/filter-search-results';

export type Filters = Map<IFilter, FilterMetadata>;

export interface IFiltersState {
	filters: Map<IFilter, FilterMetadata>;
	isLoading: boolean;
	facets: ICaseFacetsState;
	enableOnlyFavoritesSelection: boolean;
	filtersSearch: string;
	filtersSearchResults: IFilterSearchResults;
}

export const initialFiltersState: IFiltersState = {
	filters: new Map<IFilter, FilterMetadata>(),
	isLoading: true,
	facets: {
		showOnlyFavorites: false,
		filters: []
	},
	enableOnlyFavoritesSelection: false,
	filtersSearch: '',
	filtersSearchResults: {}
};

export const filtersFeatureKey = 'filters';

export const filtersStateSelector: MemoizedSelector<any, IFiltersState> = createFeatureSelector<IFiltersState>(filtersFeatureKey);

export function FiltersReducer(state: IFiltersState = initialFiltersState, action: FiltersActions) {
	switch (action.type) {

		case FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS: {
			const filters = action.payload;
			const facets = {
				...state.facets,
				filters: <ICaseFilter[]>FiltersService.buildCaseFilters(filters, state.facets.filters)
			};
			return { ...state, filters, facets, isLoading: false };
		}

		case FiltersActionTypes.INITIALIZE_FILTERS:
			return { ...state, isLoading: true };

		case FiltersActionTypes.UPDATE_FILTER_METADATA: {
			const actionPayload: { filter: IFilter, newMetadata: FilterMetadata } = action.payload;
			const clonedFilters = new Map(state.filters);

			clonedFilters.set(actionPayload.filter, actionPayload.newMetadata);
			const facets = {
				...state.facets,
				filters: <ICaseFilter<ICaseBooleanFilterMetadata | ICaseEnumFilterMetadata | ICaseSliderFilterMetadata>[]>FiltersService.buildCaseFilters(clonedFilters, state.facets.filters)
			};
			return { ...state, filters: clonedFilters, facets };
		}

		case FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION:
			return Object.assign({}, state, { enableOnlyFavoritesSelection: action.payload });

		case FiltersActionTypes.UPDATE_FACETS:
			return { ...state, facets: { ...state.facets, ...action.payload } };

		case FiltersActionTypes.SET_FILTER_SEARCH:
			return { ...state, filtersSearch: action.payload };

		case FiltersActionTypes.SET_FILTERS_SEARCH_RESULTS:
			return { ...state, filtersSearchResults: action.payload };
		default:
			return state;
	}
}

export const selectFilters = createSelector(filtersStateSelector, ({ filters }) => filters);
export const selectFacets = createSelector(filtersStateSelector, ({ facets }) => facets);
export const selectShowOnlyFavorites = createSelector(selectFacets, ({ showOnlyFavorites }: ICaseFacetsState) => showOnlyFavorites);
export const selectIsLoading = createSelector(filtersStateSelector, ({ isLoading }) => isLoading);
export const selectFiltersSearch = createSelector(filtersStateSelector, (state) => state && state.filtersSearch);
export const selectFiltersSearchResults = createSelector(filtersStateSelector, (state) => state && state.filtersSearchResults);
