import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { Filter } from '../models/filter';
import 'rxjs/add/observable/of';
import { Filters, IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { CaseFacetsState, CaseFilters } from '@ansyn/core/models/case.model';
import { FilterModel } from '@ansyn/core/models/filter.model';

export const filtersConfig: InjectionToken<IFiltersConfig> = new InjectionToken('filtersConfig');

@Injectable()
export class FiltersService {
	static buildCaseFilters(filters: Filters): CaseFilters {
		const caseFilters: CaseFilters = [];

		filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
			const currentFilter: any = caseFilters.find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

			if (!currentFilter && Boolean(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				caseFilters.push({ fieldName, metadata, type: filter.type });
			} else if (currentFilter && Boolean(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			} else if (currentFilter && !Boolean(outerStateMetadata)) {
				const index = caseFilters.indexOf(currentFilter);
				caseFilters.splice(index, 1);
			}
		});

		return caseFilters;
	}

	static pluckFilterModels(filters: Filters): FilterModel[] {
		return Array.from(filters).map(([key, value]): FilterModel => ({
			key: key.modelName,
			filterFunc: value.filterFunc.bind(value)
		}));
	}

	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	getFilters(): Filter[] {
		return this.config.filters;
	}

}
