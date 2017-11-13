import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { Filter } from '../models/filter';

import 'rxjs/add/observable/of';

export const filtersConfig: InjectionToken<IFiltersConfig> = new InjectionToken('filtersConfig');

@Injectable()
export class FiltersService {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	getFilters(): Filter[] {
		return this.config.filters;
	}

}
