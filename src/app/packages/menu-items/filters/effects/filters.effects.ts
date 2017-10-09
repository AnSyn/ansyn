import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import {
	FiltersActionTypes,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction
} from '../actions/filters.actions';
import { IFiltersState } from '../reducer/filters.reducer';
import { FiltersService } from '../services/filters.service';
import { Filter } from '../models/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { GenericTypeResolverService, InjectionResolverFilter } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

export const facetChangesActionType = [FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS, FiltersActionTypes.UPDATE_FILTER_METADATA, FiltersActionTypes.TOGGLE_ONLY_FAVORITES];

@Injectable()
export class FiltersEffects {

	/**
	 * @type Effect
	 * @name initializeFilters$
	 * @ofType InitializeFiltersAction
	 * @dependencies filters
	 * @action InitializeFiltersSuccessAction
	 */
	@Effect()
	initializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$
		.ofType(FiltersActionTypes.INITIALIZE_FILTERS)
		.withLatestFrom(this.store$.select('filters'))
		.map(([action, filtersState]: [InitializeFiltersAction, IFiltersState]) => {
			const filters: Filter[] = this.filtersService.getFilters();
			const filterMetadata: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();
			const oldFiltersArray = filtersState.oldFilters ? Array.from(filtersState.oldFilters) : [];

			filters.forEach((filter: Filter) => {
				const metadata: FilterMetadata = this.initializeMetadata(filter, action.payload.facets);

				action.payload.overlays.forEach((overlay: any) => {
					metadata.accumulateData(overlay[filter.modelName]);
				});

				metadata.enumsFields.forEach((value, key, mapObj: Map<any, any>) => {
					if (!value.count) {
						mapObj.delete(key);
					}
				});

				// Check if filters were previously deselected, and if so deselect them now
				if (oldFiltersArray) {
					const oldFilterArray = oldFiltersArray
						.find(([oldFilterKey, oldFilter]: [Filter, FilterMetadata]) => oldFilterKey.modelName === filter.modelName);


					if (oldFilterArray) {
						const [oldFilterKey, oldFilter] = oldFilterArray;
						const oldFilterFields = oldFilter.enumsFields;
						const filterFields = metadata.enumsFields;

						filterFields.forEach((value, key) => {
							let isChecked = true;
							if (oldFilterFields.has(key)) {
								const oldFilter = oldFilterFields.get(key);
								if (!oldFilter.isChecked) {
									isChecked = false;
								}
							}
							value.isChecked = isChecked;
						});
					}
				}

				if (!action.payload.facets.filters) {
					metadata.showAll();
				}

				filterMetadata.set(filter, metadata);
			});

			return new InitializeFiltersSuccessAction(filterMetadata);
		}).share();

	constructor(private actions$: Actions,
				private filtersService: FiltersService,
				private store$: Store<IFiltersState>,
				private genericTypeResolverService: GenericTypeResolverService) {
	}

	initializeMetadata(filter: Filter, facets: { filters: { fieldName: string, metadata: any }[] }): FilterMetadata {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			const filterType = filter.type;

			return function resolverFilteringFunction(filterMetadata: FilterMetadata[]): FilterMetadata {
				return filterMetadata.find((item) => item.type === filterType);
			};
		})();

		const metaData: FilterMetadata =
			this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);

		const currentFilterInit = facets.filters && facets.filters.find(({ fieldName }) => fieldName === filter.modelName);

		metaData.initializeFilter(currentFilterInit && currentFilterInit.metadata);

		return metaData;
	}
}

