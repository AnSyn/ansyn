import { FiltersActionTypes, UpdateFacetsAction } from '../actions/filters.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { FiltersService } from '@ansyn/menu-items/filters/services/filters.service';
import { Filters, IFiltersState, selectFilters } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

@Injectable()
export class FiltersEffects {
	filters$: Observable<Filters> = this.store$.select(selectFilters);

	/**
	 * @type Effect
	 * @name updateFacetFilters$
	 * @ofType filters$
	 * @action UpdateFacetsAction
	 */
	@Effect()
	updateFacetFilters$ = this.filters$
		.map((filters: Filters) => {
			const caseFilters = FiltersService.buildCaseFilters(filters);
			return new UpdateFacetsAction({ filters: caseFilters });
		});

	constructor(protected store$: Store<IFiltersState>) {
	}


}

