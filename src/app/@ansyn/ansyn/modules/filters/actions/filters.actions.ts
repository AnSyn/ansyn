import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { IFilter } from '../models/IFilter';
import { Action } from '@ngrx/store';
import { Filters } from '../reducer/filters.reducer';
import { ICaseFacetsState } from '../../menu-items/cases/models/case.model';
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

export class InitializeFiltersAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS;

	constructor(public payload?: any) {
	}
}

export class InitializeFiltersSuccessAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS;

	constructor(public payload: Filters) {
	}
}

export class UpdateFilterAction implements Action {
	type = FiltersActionTypes.UPDATE_FILTER_METADATA;

	constructor(public payload?: { filter: IFilter, newMetadata: FilterMetadata }) {
	}
}

export class EnableOnlyFavoritesSelectionAction implements Action {
	type = FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION;

	constructor(public payload?: any) {
	}
}

export class UpdateFacetsAction implements Action {
	readonly type = FiltersActionTypes.UPDATE_FACETS;

	constructor(public payload: ICaseFacetsState) {

	}
}

export class SetFilterSearch implements Action {
	readonly type = FiltersActionTypes.SET_FILTER_SEARCH;

	constructor(public payload: string) {
	}
}

export class SetFiltersSearchResults implements Action {
	readonly type = FiltersActionTypes.SET_FILTERS_SEARCH_RESULTS;

	constructor(public payload: IFilterSearchResults) {
	}
}

export type FiltersActions = InitializeFiltersAction
	| InitializeFiltersSuccessAction
	| UpdateFilterAction
	| EnableOnlyFavoritesSelectionAction
	| UpdateFacetsAction;
