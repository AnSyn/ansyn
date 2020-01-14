import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { IFilter } from '../models/IFilter';
import { createAction, props } from '@ngrx/store';
import { Filters } from '../reducer/filters.reducer';
import { ICaseFacetsState } from '../../cases/models/case.model';
import { IFilterSearchResults } from '../models/filter-search-results';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS',
	INITIALIZE_FILTERS_SUCCESS: 'INITIALIZE_FILTERS_SUCCESS',

	INITIALIZE_SINGLE_FILTER: 'INITIALIZE_SINGLE_FILTER',
	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',

	ENABLE_ONLY_FAVORITES_SELECTION: 'ENABLE_ONLY_FAVORITES_SELECTION',
	UPDATE_FACETS: 'UPDATE_FACETS',
	SET_FILTER_SEARCH: 'SET_FILTER_SEARCH',
	SET_FILTERS_SEARCH_RESULTS: 'SET_FILTERS_SEARCH_RESULTS'
};

export const InitializeFiltersAction = createAction(
										FiltersActionTypes.INITIALIZE_FILTERS,
										(payload: any = {}) => (payload)
);

export const InitializeFiltersSuccessAction = createAction(
												FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS,
												props<Filters>()
);

export const UpdateFilterAction = createAction(
									FiltersActionTypes.UPDATE_FILTER_METADATA,
									props<{ filter: IFilter, newMetadata: FilterMetadata }>()
);

export const EnableOnlyFavoritesSelectionAction = createAction(
													FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION,
													props<{payload: any}>()
);

export const UpdateFacetsAction = createAction(
									FiltersActionTypes.UPDATE_FACETS,
									props<ICaseFacetsState>()
);

export const SetFilterSearch = createAction(
								FiltersActionTypes.SET_FILTER_SEARCH,
								props<{payload: string}>()
);

export const SetFiltersSearchResults = createAction(
										FiltersActionTypes.SET_FILTERS_SEARCH_RESULTS,
										props<IFilterSearchResults>()
);
