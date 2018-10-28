import { Action } from '@ngrx/store';
import { ICaseFacetsState, ICaseFilter } from '@ansyn/core';

export const FiltersActionTypes = {
	UPDATE_FILTER_METADATA: 'UPDATE_FILTER_METADATA',
	ENABLE_ONLY_FAVORITES_SELECTION: 'ENABLE_ONLY_FAVORITES_SELECTION',
	UPDATE_FACETS: 'UPDATE_FACETS'
};

export class UpdateFilterAction implements Action {
	type = FiltersActionTypes.UPDATE_FILTER_METADATA;

	constructor(public payload?: ICaseFilter) {
	}
}

export class EnableOnlyFavoritesSelectionAction implements Action {
	type = FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION;

	constructor(public payload?: any) {
	}
}

export class UpdateFilters {

}

export class UpdateFacetsAction implements Action {
	readonly type = FiltersActionTypes.UPDATE_FACETS;

	constructor(public payload: ICaseFacetsState) {

	}
}

export type FiltersActions = UpdateFilterAction
	| EnableOnlyFavoritesSelectionAction
	| UpdateFacetsAction;
