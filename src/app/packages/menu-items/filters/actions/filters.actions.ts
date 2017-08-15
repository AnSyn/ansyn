import { FilterMetadata } from './../models/metadata/filter-metadata.interface';
import { Filter } from './../models/filter';
import { Action } from '@ngrx/store';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS',
	INITIALIZE_FILTERS_SUCCESS: 'INITIALIZE_FILTERS_SUCCESS',

	INITIALIZE_SINGLE_FILTER: 'INITIALIZE_SINGLE_FILTER',
	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',

	RESET_FILTERS: 'RESET_FILTERS',
	TOGGLE_ONLY_FAVORITES: 'TOGGLE_ONLY_FAVORITES',
	DISPLAY_ONLY_FAVORITES_SELECTION: 'DISPLAY_ONLY_FAVORITES_SELECTION'
};

export type FiltersActions = any;

export class InitializeFiltersAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS;
	constructor(public payload?: { overlays: any[], facets: { filters: { fieldName: string, metadata: any }[] }, showAll?: boolean }) { }
}

export class InitializeFiltersSuccessAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS;
	constructor(public payload?: Map<Filter, FilterMetadata>) { }
}

export class UpdateFilterAction implements Action {
	type = FiltersActionTypes.UPDATE_FILTER_METADATA;
	constructor(public payload?: { filter: Filter, newMetadata: FilterMetadata }) { }
}

export class ResetFiltersAction implements Action {
	type = FiltersActionTypes.RESET_FILTERS;
	constructor(public payload?: any) { }
}

export class ToggleOnlyFavoriteAction implements Action {
	type = FiltersActionTypes.TOGGLE_ONLY_FAVORITES;
	constructor(public payload?: any){}
}

export class DisplayOnlyFavortiesSelectionAction implements Action{
	type = FiltersActionTypes.DISPLAY_ONLY_FAVORITES_SELECTION;
	constructor(public payload?: any){}
}

