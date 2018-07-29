import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { MenuActionTypes } from '../actions/menu.actions';

@Injectable()
export class MenuEffects {

	/**
	 * @type Effect
	 * @name onSelectMenuItem$
	 * @ofType SelectMenuItemAction
	 */
	@Effect({ dispatch: false })
	onSelectMenuItem$: Observable<any> = this.actions$
		.ofType(MenuActionTypes.SELECT_MENU_ITEM)
		.share();

	constructor(protected actions$: Actions) {
	}
}
