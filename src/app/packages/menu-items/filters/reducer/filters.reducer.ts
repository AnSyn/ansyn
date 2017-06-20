import { FiltersActionTypes } from './../actions/filters.actions';
import { FilterMetadata } from './../models/metadata/filter-metadata.interface';
import { FiltersActions } from '../actions/filters.actions';

export interface IFiltersState {
    filters: FilterMetadata[];
}

export const initialFiltersState: IFiltersState = {
    filters: []
};

export function FiltersReducer(state: IFiltersState = initialFiltersState, action: FiltersActions) {

    switch (action.type) {

        case FiltersActionTypes.INITIALIZE_FILTERS:
            return Object.assign({}, state, { filters: action.payload });
    }
}
