import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { Filter } from '../models/filter';
import 'rxjs/add/observable/of';
import { FilterMetadata } from '@ansyn/menu-items/filters';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { CaseFacetsState, CaseFilters } from '@ansyn/core';

export const filtersConfig: InjectionToken<IFiltersConfig> = new InjectionToken('filtersConfig');

@Injectable()
export class FiltersService {
	static buildCaseFacets(filtersState: IFiltersState): CaseFacetsState {
		const { showOnlyFavorites } = filtersState;
		const filters: CaseFilters = { Boolean: [], Enum: [], Slider: [] };

		filtersState.filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
			const currentFilter: any = filters[filter.type].find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

			if (!currentFilter && Boolean(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				filters[filter.type].push({ fieldName, metadata });
			} else if (currentFilter && Boolean(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			} else if (currentFilter && Boolean(outerStateMetadata)) {
				const index = filters[filter.type].indexOf(currentFilter);
				filters[filter.type].splice(index, 1);
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
