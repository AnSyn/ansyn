import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { StatusBarActionsTypes, UpdateGeoFilterStatus } from '../actions/status-bar.actions';
import { ClearActiveInteractionsAction } from '../../menu-items/tools/actions/tools.actions';
import { map } from 'rxjs/operators';


@Injectable()
export class StatusBarEffects {

	@Effect()
	onGeoFilterUpdate$ = this.actions$.pipe(
		ofType<UpdateGeoFilterStatus>(StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS),
		map( () => new ClearActiveInteractionsAction({ skipClearFor: [UpdateGeoFilterStatus] }))
	);

	constructor(protected actions$: Actions) {
	}
}

