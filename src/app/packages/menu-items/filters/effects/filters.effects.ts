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
import { Injectable, Injector } from '@angular/core';
import { GenericTypeResolverService, InjectionResolverFilter } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FiltersEffects {

	@Effect()
	initializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$
		.ofType(FiltersActionTypes.INITIALIZE_FILTERS)
		.switchMap((action: InitializeFiltersAction) => {
			return this.filtersService.loadFilters().map((filters: Filter[]) => {
				const filterMetadatas: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();
				filters.forEach((filter: Filter) => {
					const metadata: FilterMetadata = this.initializeMetadata(filter, action.payload.facets);

					action.payload.overlays.forEach((overlay: any) => {
						metadata.accumulateData(overlay[filter.modelName]);
					});

					if (action.payload.showAll) {
						metadata.showAll();
					}

					filterMetadatas.set(filter, metadata);
				});
				return new InitializeFiltersSuccessAction(filterMetadatas);
			});
		}).share();


	constructor(private actions$: Actions,
				private filtersService: FiltersService,
				private store: Store<IFiltersState>,
				private genericTypeResolverService: GenericTypeResolverService) {
	}

	initializeMetadata(filter: Filter, facets: { filters: { fieldName: string, metadata: any }[] }): FilterMetadata {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			const filterType = filter.type;

			return function resolverFilteringFunction(FilterMetadatas: FilterMetadata[]): FilterMetadata {
				return FilterMetadatas.find((item) => item.type === filterType);
			};
		})();
		const metaData: FilterMetadata =
			this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);

		const currentFilterInit = facets
			&& facets.filters.find(field => {
				return field.fieldName === filter.modelName;
			});

		metaData.initializeFilter(currentFilterInit && currentFilterInit.metadata);

		return metaData;
	}
}

