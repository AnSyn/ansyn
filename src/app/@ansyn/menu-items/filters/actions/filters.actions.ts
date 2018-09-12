import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { IFilter } from '../models/IFilter';
import { Action } from '@ngrx/store';
import { ICaseFacetsState } from '@ansyn/core';
import { Filters } from '../reducer/filters.reducer';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS',
	INITIALIZE_FILTERS_SUCCESS: 'INITIALIZE_FILTERS_SUCCESS',

	INITIALIZE_SINGLE_FILTER: 'INITIALIZE_SINGLE_FILTER',
	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',

	RESET_FILTERS: 'RESET_FILTERS',
	ENABLE_ONLY_FAVORITES_SELECTION: 'ENABLE_ONLY_FAVORITES_SELECTION',
	UPDATE_FACETS: 'UPDATE_FACETS'
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

export class ResetFiltersAction implements Action {
	type = FiltersActionTypes.RESET_FILTERS;

	constructor(public payload?: any) {
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

export type FiltersActions = InitializeFiltersAction
	| InitializeFiltersSuccessAction
	| UpdateFilterAction
	| ResetFiltersAction
	| EnableOnlyFavoritesSelectionAction
	| UpdateFacetsAction;
