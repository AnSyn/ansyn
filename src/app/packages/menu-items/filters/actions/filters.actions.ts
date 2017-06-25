import { FilterMetadata } from './../models/metadata/filter-metadata.interface';
import { Filter } from './../models/filter';
import { Action } from '@ngrx/store';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS',

	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',

	RESET_FILTERS: 'RESET_FILTERS'
};

export type FiltersActions = any;

export class InitializeFiltersAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS;
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


