import { Filter } from '../models/filter';
import { FiltersActionTypes } from './../actions/filters.actions';
import { FilterMetadata } from './../models/metadata/filter-metadata.interface';
import { FiltersActions } from '../actions/filters.actions';

export interface IFiltersState {
    filters: Map<Filter, FilterMetadata>;
    isLoading: boolean;
}

export const initialFiltersState: IFiltersState = {
    filters: new Map<Filter, FilterMetadata>(),
    isLoading: true
};

export function FiltersReducer(state: IFiltersState = initialFiltersState, action: FiltersActions) {
    switch (action.type) {

        case FiltersActionTypes.INITIALIZE_FILTERS:
            return Object.assign({}, state, { filters: action.payload, isLoading: false });

        case FiltersActionTypes.UPDATE_FILTER_METADATA:
            const actionPayload: { filter: Filter, newMetadata: FilterMetadata } = action.payload;
            const clonedFilters = new Map(state.filters);

            clonedFilters.set(actionPayload.filter,actionPayload.newMetadata);

            return Object.assign({}, state, { filters: clonedFilters });
            
        default:
            return Object.assign({}, state);
    }
}
