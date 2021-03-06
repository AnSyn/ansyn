import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { IFilter } from '../models/IFilter';
import { Action } from '@ngrx/store';
import { FiltersMetadata, FiltersCounters } from '../reducer/filters.reducer';
import { ICaseFacetsState } from '../../menu-items/cases/models/case.model';
import { IFilterSearchResults } from '../models/filter-search-results';
import { FilterCounters } from '../models/counters/filter-counters.interface';
import { ILogMessage } from '../../core/models/logger.model';

export const FiltersActionTypes = {
	INITIALIZE_FILTERS: 'INITIALIZE_FILTERS',
	INITIALIZE_FILTERS_SUCCESS: 'INITIALIZE_FILTERS_SUCCESS',

	INITIALIZE_SINGLE_FILTER: 'INITIALIZE_SINGLE_FILTER',
	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',
	UPDATE_FILTERS_COUNTERS: 'UPDATE_FILTERS_COUNTERS',

	ENABLE_ONLY_FAVORITES_SELECTION: 'ENABLE_ONLY_FAVORITES_SELECTION',
	UPDATE_FACETS: 'UPDATE_FACETS',
	SET_FILTER_SEARCH: 'SET_FILTER_SEARCH',
	SET_FILTERS_SEARCH_RESULTS: 'SET_FILTERS_SEARCH_RESULTS',
	SELECT_ONLY_GEO_REGISTERED: 'SELECT_ONLY_GEO_REGISTERED',
	LOG_FILTERS: 'LOG_FILTERS',
	LOG_OPEN_FILTER_POPUP: 'LOG_OPEN_FILTER_POPUP'
};

export class InitializeFiltersAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS;

	constructor(public payload?: any) {
	}
}

export class InitializeFiltersSuccessAction implements Action {
	type = FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS;

	constructor(public payload: { filtersMetadata: FiltersMetadata, filtersCounters: FiltersCounters }) {
	}
}

export class UpdateFilterAction implements Action {
	type = FiltersActionTypes.UPDATE_FILTER_METADATA;

	constructor(public payload?: { filter: IFilter, newMetadata: FilterMetadata }) {
	}
}

export class UpdateFiltersCounters implements Action {
	type = FiltersActionTypes.UPDATE_FILTERS_COUNTERS;

	constructor(public payload: { filter: IFilter, newCounters: FilterCounters }[]) {
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

export class SelectOnlyGeoRegistered implements Action {
	readonly type = FiltersActionTypes.SELECT_ONLY_GEO_REGISTERED;

}

export class LogFilters implements Action, ILogMessage {
	readonly type = FiltersActionTypes.LOG_FILTERS;

	constructor(public payload: string) {
	}

	logMessage() {
		return this.payload
	}
}

export class LogOpenFilterPopup implements Action, ILogMessage {
	readonly type = FiltersActionTypes.LOG_OPEN_FILTER_POPUP;

	constructor(public payload: { filterName: string }) {
	}

	logMessage() {
		return `Filters panel: opening ${this.payload.filterName} popup`
	}
}

export type FiltersActions = InitializeFiltersAction
	| InitializeFiltersSuccessAction
	| UpdateFilterAction
	| UpdateFiltersCounters
	| EnableOnlyFavoritesSelectionAction
	| UpdateFacetsAction;
