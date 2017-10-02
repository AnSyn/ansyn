import { Filter } from '../models/filter';
import { FiltersActions, FiltersActionTypes } from '../actions/filters.actions';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';

export interface IFiltersState {
	filters: Map<Filter, FilterMetadata>;
	oldFilters: Map<Filter, FilterMetadata>;
	isLoading: boolean;
	showOnlyFavorites: boolean;
	enableOnlyFavoritesSelection: boolean;
}

export const initialFiltersState: IFiltersState = {
	filters: new Map<Filter, FilterMetadata>(),
	oldFilters: null,
	isLoading: true,
	showOnlyFavorites: false,
	enableOnlyFavoritesSelection: false
};

export function FiltersReducer(state: IFiltersState = initialFiltersState, action: FiltersActions) {
	switch (action.type) {

		case FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS:
			return Object.assign({}, state, { filters: action.payload, isLoading: false });

		case FiltersActionTypes.INITIALIZE_FILTERS:
			return Object.assign({}, state, { isLoading: true });

		case FiltersActionTypes.UPDATE_FILTER_METADATA:
			const actionPayload: { filter: Filter, newMetadata: FilterMetadata } = action.payload;
			const clonedFilters = new Map(state.filters);

			clonedFilters.set(actionPayload.filter, actionPayload.newMetadata);

			return Object.assign({}, state, { filters: clonedFilters });

		case FiltersActionTypes.RESET_FILTERS:
			return {
				...state,
				oldFilters: state.filters,
				filters: new Map<Filter, FilterMetadata>(),
				isLoading: true
			};

		case FiltersActionTypes.TOGGLE_ONLY_FAVORITES:
			return Object.assign({}, state, { showOnlyFavorites: !state.showOnlyFavorites });

		case FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION:
			return Object.assign({}, state, { enableOnlyFavoritesSelection: action.payload });

		default:
			return state; // Object.assign({},state);
	}
}
