import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NavigateCaseTriggerAction, RouterActionTypes } from '../actions/router.actions';
import { Router } from '@angular/router';

@Injectable()
export class RouterEffects {

	/**
	 * @type Effect
	 * @name onNavigateCase$
	 * @ofType NavigateCaseTriggerAction
	 */
	@Effect({ dispatch: false })
	onNavigateCase$: Observable<any> = this.actions$
		.ofType<NavigateCaseTriggerAction>(RouterActionTypes.NAVIGATE_CASE)
		.do(({ payload }) => {
			if (payload) {
				this.router.navigate(['case', payload]);
			} else {
				this.router.navigate(['']);
			}
		});

	constructor(protected actions$: Actions, protected router: Router) {
	}

}
