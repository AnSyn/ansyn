import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { SetLayoutAction, SetWindowLayout } from '@ansyn/core/actions/core.actions';
import { LoadDefaultCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { WindowLayout } from '@ansyn/core/reducers/core.reducer';

@Injectable()
export class AnsynApi {

	constructor(public store: Store<any>, protected actions$: Actions) {
	}


	changeMapLayout(layout) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	loadDefaultCase() {
		this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeWindowLayout(windowLayout: WindowLayout) {
		this.store.dispatch(new SetWindowLayout({ windowLayout }));
	}

}
