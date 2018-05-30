import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { Store } from '@ngrx/store';

@Injectable()
export class FiltersEffects {

	constructor(protected store$: Store<IFiltersState>) {
	}


}

