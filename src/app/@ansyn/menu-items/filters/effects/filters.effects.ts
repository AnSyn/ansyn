import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IFiltersState } from '../reducer/filters.reducer';

@Injectable()
export class FiltersEffects {

	constructor(protected store$: Store<IFiltersState>) {
	}


}

