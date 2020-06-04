import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IFilter } from '../models/IFilter';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { FiltersActions, FiltersActionTypes, InitializeFiltersSuccessAction } from '../actions/filters.actions';
import { FiltersService } from '../services/filters.service';
import {
	ICaseBooleanFilterMetadata,
	ICaseEnumFilterMetadata,
	ICaseFacetsState,
	ICaseFilter,
	ICaseSliderFilterMetadata
} from '../../menu-items/cases/models/case.model';
import { IFilterSearchResults } from '../models/filter-search-results';
import { EnumFilterMetadata } from '../models/metadata/enum-filter-metadata';
import { FilterCounters } from '../models/counters/filter-counters.interface';

export type FiltersMetadata = Map<IFilter, FilterMetadata>;
export type FiltersCounters = Map<IFilter, FilterCounters>;

export function filtersToString(filtersMetadata: FiltersMetadata): string {
	let result = (Boolean(filtersMetadata) ? '' : '"null"');
	if (!Boolean(filtersMetadata)) {
		return result;
	}
	const entriesArray = Array.from(filtersMetadata.entries());
	result += '[';
	entriesArray.forEach((entry) => {
		result += '{"filterData": [' + JSON.stringify(entry[0]) + ',';
		if (entry[1] instanceof EnumFilterMetadata) {
			const enumData = <EnumFilterMetadata>entry[1];
			result += '{"collapse": ' + `"${ enumData.collapse }",`;
			result += ' "type": ' + `"${ enumData.type }",`;
			result += ' "visible": ' + `"${ enumData.visible }",`;
			result += ' "enumsFields": ' + JSON.stringify(Array.from(enumData.enumsFields.entries())) + '}';
		} else {
			result += ' ' + JSON.stringify(entry[1]);
		}
		result += ']},';
	});
	result = result.substring(0, result.length - 1);
	result += '';
	result += ']';
	return result;
}

export interface IFiltersState {
	filtersMetadata: FiltersMetadata;
	filtersCounters: FiltersCounters;
	isLoading: boolean;
	facets: ICaseFacetsState;
	enableOnlyFavoritesSelection: boolean;
	filtersSearch: string;
	filtersSearchResults: IFilterSearchResults;
}

export const initialFiltersState: IFiltersState = {
	filtersMetadata: new Map<IFilter, FilterMetadata>(),
	filtersCounters: new Map<IFilter, FilterCounters>(),
	isLoading: true,
	facets: {
		showOnlyFavorites: false,
		filters: []
	},
	enableOnlyFavoritesSelection: false,
	filtersSearch: '',
	filtersSearchResults: {}
};

export const filtersFeatureKey = 'filters';

export const filtersStateSelector: MemoizedSelector<any, IFiltersState> = createFeatureSelector<IFiltersState>(filtersFeatureKey);

export function FiltersReducer(state: IFiltersState = initialFiltersState, action: FiltersActions) {
	switch (action.type) {

		case FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS: {
			const { filtersMetadata, filtersCounters } = (action as InitializeFiltersSuccessAction).payload;
			const facets = {
				...state.facets,
				filters: <ICaseFilter[]>FiltersService.buildCaseFilters(filtersMetadata, state.facets.filters)
			};
			return { ...state, filtersMetadata, filtersCounters, facets, isLoading: false };
		}

		case FiltersActionTypes.INITIALIZE_FILTERS:
			return { ...state, isLoading: true };

		case FiltersActionTypes.UPDATE_FILTER_METADATA: {
			const actionPayload: { filter: IFilter, newMetadata: FilterMetadata } = action.payload;
			const clonedFiltersMetadata = new Map(state.filtersMetadata);

			clonedFiltersMetadata.set(actionPayload.filter, actionPayload.newMetadata);
			const facets = {
				...state.facets,
				filters: <ICaseFilter<ICaseBooleanFilterMetadata | ICaseEnumFilterMetadata | ICaseSliderFilterMetadata>[]>FiltersService.buildCaseFilters(clonedFiltersMetadata, state.facets.filters)
			};
			return { ...state, filtersMetadata: clonedFiltersMetadata, facets };
		}

		case FiltersActionTypes.UPDATE_FILTER_COUNTERS: {
			const actionPayload: { filter: IFilter, newCounters: FilterCounters } = action.payload;
			const clonedCouters = new Map(state.filtersCounters);
			clonedCouters.set(actionPayload.filter, actionPayload.newCounters);
			return { ...state, filtersCounters: clonedCouters };
		}

		case FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION:
			return Object.assign({}, state, { enableOnlyFavoritesSelection: action.payload });

		case FiltersActionTypes.UPDATE_FACETS:
			return { ...state, facets: { ...state.facets, ...action.payload } };

		case FiltersActionTypes.SET_FILTER_SEARCH:
			return { ...state, filtersSearch: action.payload };

		case FiltersActionTypes.SET_FILTERS_SEARCH_RESULTS:
			return { ...state, filtersSearchResults: action.payload };
		default:
			return state;
	}
}

export const selectFiltersMetadata = createSelector(filtersStateSelector, (state) => state?.filtersMetadata);
export const selectFiltersCounters = createSelector(filtersStateSelector, (state) => state?.filtersCounters);
export const selectFacets = createSelector(filtersStateSelector, (state) => state && state.facets);
export const selectShowOnlyFavorites = createSelector(selectFacets, (state) => state && state.showOnlyFavorites);
export const selectIsLoading = createSelector(filtersStateSelector, ({ isLoading }) => isLoading);
export const selectFiltersSearch = createSelector(filtersStateSelector, (state) => state && state.filtersSearch);
export const selectFiltersSearchResults = createSelector(filtersStateSelector, (state) => state && state.filtersSearchResults);
export const selectEnableOnlyFavorites = createSelector(filtersStateSelector, (state) => state && state.enableOnlyFavoritesSelection);
