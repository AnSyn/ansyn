import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { Filter } from '../models/filter';
import { isNil } from 'lodash';
import 'rxjs/add/observable/of';
import { FilterMetadata } from '@ansyn/menu-items/filters';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { CaseFacetsState } from '@ansyn/core';
import { CaseFilter } from '@ansyn/core/models/case.model';

export const filtersConfig: InjectionToken<IFiltersConfig> = new InjectionToken('filtersConfig');

@Injectable()
export class FiltersService {
	static buildCaseFacets(filtersState: IFiltersState): CaseFacetsState {
		const { showOnlyFavorites } = filtersState;
		const filters: CaseFilter[] = [];

		filtersState.filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
			const currentFilter: any = filters.find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

			if (!currentFilter && !isNil(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				filters.push({ fieldName, metadata });
			} else if (currentFilter && !isNil(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			} else if (currentFilter && isNil(outerStateMetadata)) {
				const index = filters.indexOf(currentFilter);
				filters.splice(index, 1);
			}
		});
		return { showOnlyFavorites, filters };
	}

	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	getFilters(): Filter[] {
		return this.config.filters;
	}

}
