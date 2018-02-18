import { EnumFilterMetadata } from '../models/metadata/enum-filter-metadata';
import * as reducer from './filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { Filter } from '../models/filter';
import * as actions from '../actions/filters.actions';

describe('FiltersReducer', () => {
	// it('INITIALIZE_FILTERS should update the state and set loading to false', () => {
	//     const initMap = new Map<Filter, FilterMetadata>();
	//     const action: actions.InitializeFiltersAction = new actions.InitializeFiltersAction(initMap);
	//     const result: reducer.IFiltersState = reducer.FiltersReducer(reducer.initialFiltersState, action);

	//     expect(result.filters).toEqual(initMap);
	//     expect(result.isLoading).toEqual(false);
	// });

	it('UPDATE_FILTER_METADATA should update the metadata of the filter in the store$', () => {
		const filter1: Filter = { modelName: 'filter1', displayName: 'filter1', type: 'Enum' };
		const metadata1: FilterMetadata = new EnumFilterMetadata();
		metadata1.initializeFilter(['metadata1']);

		const filter2: Filter = { modelName: 'filter2', displayName: 'filter2', type: 'Enum' };
		const metadata2: FilterMetadata = new EnumFilterMetadata();
		metadata2.initializeFilter(['metadata2']);

		const metadata3: FilterMetadata = new EnumFilterMetadata();
		metadata3.initializeFilter(['metadata3']);

		const initialState = new Map<Filter, FilterMetadata>();
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
