import { EnumFilterMetadata } from '../models/metadata/enum-filter-metadata';
import * as reducer from './filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { IFilter } from '../models/IFilter';
import { FilterType } from '@ansyn/core';
import * as actions from '../actions/filters.actions';

describe('FiltersReducer', () => {

	it('UPDATE_FILTER_METADATA should update the metadata of the filter in the store', () => {
		const filter1: IFilter = { modelName: 'filter1', displayName: 'filter1', type: FilterType.Enum };
		const metadata1: FilterMetadata = new EnumFilterMetadata();
		metadata1.initializeFilter([], 'filter1', ['metadata1']);

		const filter2: IFilter = { modelName: 'filter2', displayName: 'filter2', type: FilterType.Enum };
		const metadata2: FilterMetadata = new EnumFilterMetadata();
		metadata2.initializeFilter([], 'filter2', ['metadata2']);

		const metadata3: FilterMetadata = new EnumFilterMetadata();
		metadata3.initializeFilter([], 'filter3', ['metadata3']);

		const initialState = new Map<IFilter, FilterMetadata>();
		initialState.set(filter1, metadata1);
		initialState.set(filter2, metadata2);

		reducer.initialFiltersState.filters = initialState;

		let action: actions.UpdateFilterAction = new actions.UpdateFilterAction({
			filter: filter2,
			newMetadata: metadata3
		});

		let result: reducer.IFiltersState = reducer.FiltersReducer(reducer.initialFiltersState, action);

		expect(result.filters.get(filter1)).toEqual(metadata1);
		expect(result.filters.get(filter2)).toEqual(metadata3);
	});
});
