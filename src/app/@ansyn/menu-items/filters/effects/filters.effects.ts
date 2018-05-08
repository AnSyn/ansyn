import { FiltersActionTypes } from '../actions/filters.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

export const facetChangesActionType = [FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS, FiltersActionTypes.UPDATE_FILTER_METADATA, FiltersActionTypes.TOGGLE_ONLY_FAVORITES];

@Injectable()
export class FiltersEffects {

	constructor(protected actions$: Actions) {
	}


}

