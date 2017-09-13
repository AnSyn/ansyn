import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes } from '@ansyn/core';

@Injectable()
export class MenuEffects {
	@Effect({ dispatch: false })
	onSelectMenuItem$: Observable<any> = this.actions$
		.ofType(MenuActionTypes.SELECT_MENU_ITEM)
		.map((action) => {
			return action;
		}).share();

	constructor(private actions$: Actions) {
	}
}
