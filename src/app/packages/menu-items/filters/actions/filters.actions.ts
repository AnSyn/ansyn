import { FilterMetadata } from './../models/metadata/filter-metadata.interface';
import { Filter } from './../models/filter';
import { Action } from '@ngrx/store';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS'
};

export type FiltersActions = any;

export class InitializeFiltersAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS;
	constructor(public payload?: Map<Filter, FilterMetadata>) { }
}
