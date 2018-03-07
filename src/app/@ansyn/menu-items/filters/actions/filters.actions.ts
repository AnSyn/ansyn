import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { Filter } from '../models/filter';
import { Action } from '@ngrx/store';
import { CaseFacetsState } from '@ansyn/core/models/case.model';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS',
	INITIALIZE_FILTERS_SUCCESS: 'INITIALIZE_FILTERS_SUCCESS',

	INITIALIZE_SINGLE_FILTER: 'INITIALIZE_SINGLE_FILTER',
	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',

	RESET_FILTERS: 'RESET_FILTERS',
	TOGGLE_ONLY_FAVORITES: 'TOGGLE_ONLY_FAVORITES',
	ENABLE_ONLY_FAVORITES_SELECTION: 'ENABLE_ONLY_FAVORITES_SELECTION'
};

export type FiltersActions = any;

export class InitializeFiltersAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS;

	constructor(public payload?: { overlays: any[], facets: CaseFacetsState }) {
	}
}

export class InitializeFiltersSuccessAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS;

	constructor(public payload: { filters?: Map<Filter, FilterMetadata>, showOnlyFavorites?: boolean } ) {
	}
}

export class UpdateFilterAction implements Action {
	type = FiltersActionTypes.UPDATE_FILTER_METADATA;

	constructor(public payload?: { filter: Filter, newMetadata: FilterMetadata }) {
	}
}

export class ResetFiltersAction implements Action {
	type = FiltersActionTypes.RESET_FILTERS;

	constructor(public payload?: any) {
	}
}

export class ToggleOnlyFavoriteAction implements Action {
	type = FiltersActionTypes.TOGGLE_ONLY_FAVORITES;

	constructor(public payload?: any) {
	}
}

export class EnableOnlyFavoritesSelectionAction implements Action {
	type = FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION;

	constructor(public payload?: any) {
	}
}

