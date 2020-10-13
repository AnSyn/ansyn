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
import { EnumFilterMetadata, IEnumFiled } from '../models/metadata/enum-filter-metadata';
import { FilterCounters } from '../models/counters/filter-counters.interface';
import { GeoRegisteration } from '../../overlays/models/overlay.model';

export type FiltersMetadata = Map<IFilter, FilterMetadata>;
export type FiltersCounters = Map<IFilter, FilterCounters>;

export function filtersToString(filters: Filters): string {
	if (!Boolean(filters)) {
		return '\nNo filters found';
	}
	let result = '';
	filters.forEach((metadata, key) => {
		if (metadata instanceof EnumFilterMetadata) {
			const enumFieldsArray: IEnumFiled[] = Array.from(metadata.enumsFields.values());
			const unchecked = enumFieldsArray.filter(({ isChecked }) => !isChecked);
			if (unchecked.length === 0) {
				return;
			}
			const checked = enumFieldsArray.filter(({ isChecked }) => isChecked);
			const keyList = (arr: IEnumFiled[]) => arr.map(({ key }) => key).join();
			result += `\nfilter: ${key.displayName}`;
			result += checked.length > 0 ? ` Checked: ${keyList(checked)} Unchecked: ${keyList(unchecked)}` : ` Unchecked: All`;
		} else {
			// Todo: non-enum filters
		}
	});
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
	isLoading: false,
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

		case FiltersActionTypes.UPDATE_FILTERS_COUNTERS: {
			const changes: { filter: IFilter, newCounters: FilterCounters }[] = action.payload;
			const clonedCouters = new Map(state.filtersCounters);
			changes.forEach(filterChanges => {
				clonedCouters.set(filterChanges.filter, filterChanges.newCounters);
			});
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

		case FiltersActionTypes.SELECT_ONLY_GEO_REGISTERED:
			const newFilters = new Map(state.filtersMetadata);
			newFilters.forEach( (value, key) => {
				if (key.modelName === 'isGeoRegistered') {
					(value as EnumFilterMetadata).selectOnly(GeoRegisteration.geoRegistered);
				}
			});
			return {...state};

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
