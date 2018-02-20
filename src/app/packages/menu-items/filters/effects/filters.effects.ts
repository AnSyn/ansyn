import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import {
	FiltersActionTypes,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction
} from '../actions/filters.actions';
import { filtersStateSelector, IFiltersState } from '../reducer/filters.reducer';
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
import { CaseFacetsState, CaseFilter, CaseFilters } from '@ansyn/core/models/case.model';

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
		.ofType<InitializeFiltersAction>(FiltersActionTypes.INITIALIZE_FILTERS)
		.withLatestFrom(this.store$.select(filtersStateSelector))
		.map(([action, filtersState]: [InitializeFiltersAction, IFiltersState]) => {
			const filtersConfig: Filter[] = this.filtersService.getFilters();
			const filters: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();
			const oldFiltersArray = filtersState.oldFilters ? Array.from(filtersState.oldFilters) : [];

			filtersConfig.forEach((filter: Filter) => {
				const metadata: FilterMetadata = this.initializeMetadata(filter, action.payload.facets);

				action.payload.overlays.forEach((overlay: any) => {
					metadata.accumulateData(overlay[filter.modelName]);
				});

				metadata.postInitializeFilter({ oldFiltersArray: oldFiltersArray, modelName: filter.modelName });

				const currentFilterInit = action.payload.facets.filters &&
					action.payload.facets.filters.find(({ fieldName }) => fieldName === filter.modelName);

				if (!currentFilterInit) {
					metadata.showAll();
				}

				filters.set(filter, metadata);
			});

			return new InitializeFiltersSuccessAction({ filters, showOnlyFavorites: action.payload.facets.showOnlyFavorites });
		}).share();

	constructor(protected actions$: Actions,
				protected filtersService: FiltersService,
				protected store$: Store<IFiltersState>,
				protected genericTypeResolverService: GenericTypeResolverService) {
	}

	initializeMetadata(filter: Filter, facets: CaseFacetsState): FilterMetadata {
		const filterType = filter.type;

		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			return function resolverFilteringFunction(filterMetadata: FilterMetadata[]): FilterMetadata {
				return filterMetadata.find((item) => item.type === filterType);
			};
		})();

		const metaData: FilterMetadata =
			this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);

		const currentFilterInit = <CaseFilter> facets.filters && facets.filters.find(({ fieldName }) => fieldName === filter.modelName);

		metaData.initializeFilter(currentFilterInit && currentFilterInit.metadata, filter);
		return metaData;
	}
}

