import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { IFiltersState, selectFilters, selectFiltersSearch } from '../reducer/filters.reducer';
import { combineLatest } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { createEffect } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { FilterType } from '../models/filter-type';
import { SetFiltersSearchResults } from '../actions/filters.actions';
import { IFilterSearchResults } from '../models/filter-search-results';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable()
export class FiltersEffects {

	onFilterSearch$ = createEffect(() => combineLatest(this.store$.pipe(select(selectFiltersSearch)),
														this.store$.pipe(select(selectFilters)))
														.pipe(
		mergeMap(([filtersSearch, filters]) => fromPromise(this.getFiltersSearchResults([filtersSearch, filters]))),
		map((filtersSearchResults) => SetFiltersSearchResults(filtersSearchResults))
	));

	private async getIncludedKeys([filtersSearch, filterKey, filterVal]) {
		if (filterKey.displayName.toLowerCase().includes(filtersSearch)) {
			return 'all';
		} else {
			const includedKeys = [];
			const fields = filterKey.type === FilterType.Enum ? filterVal.enumsFields : filterKey.type === FilterType.Array ? filterVal.fields : new Map();
			for (const key of Array.from(fields.keys())) {
				const keyTranslate = await this.translate.get((key || 'Unknown').toString()).toPromise();
				const lowerKeyTranslate = keyTranslate.toLowerCase();
				if (lowerKeyTranslate.includes(filtersSearch) || filtersSearch.includes(lowerKeyTranslate)) {
					includedKeys.push(key);
				}
			}
			return includedKeys;
		}
	};

	private async getFiltersSearchResults([filtersSearch, filters]): Promise<IFilterSearchResults> {
		const filtersSearchResults: IFilterSearchResults = {};
		const lowerFiltersSearch = filtersSearch.toLowerCase();
		for (const [filterKey, filterVal] of Array.from<any>(filters)) {
			const includedKeys = await this.getIncludedKeys([lowerFiltersSearch, filterKey, filterVal]);
			filtersSearchResults[filterKey.displayName] = includedKeys;
		}
		return filtersSearchResults;
	}

	constructor(protected store$: Store<IFiltersState>, protected translate: TranslateService) {
	}
}

