import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { RouterActionTypes } from '../actions/router.actions';
import { AnsynRouterService } from '../services/router.service';
import { Router } from '@angular/router';

@Injectable()
export class RouterEffects {

	@Effect({dispatch: false})
	onNavigateCase$: Observable<any> = this.actions$
		.ofType(RouterActionTypes.NAVIGATE_CASE)
		.do(({payload}) => {
			if (payload) {
				this.router.navigate(['case', payload])
			} else {
				this.router.navigate([''])
			}
		});

	constructor(private actions$: Actions, private router: Router){}

}
