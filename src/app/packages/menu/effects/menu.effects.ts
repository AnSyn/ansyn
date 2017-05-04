import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { CoreActionTypes } from '../../core/actions/core.actions';

@Injectable()
export class MenuEffects {

	constructor(private actions$: Actions){}
	@Effect({dispatch: false})
	onSelectMenuItem$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.SELECT_MENU_ITEM)
		.map((action) => {
			return action
		}).share();


}
