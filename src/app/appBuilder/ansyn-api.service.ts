import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from '@ansyn/core/index';
import { Actions } from '@ngrx/effects';
import { LoadDefaultCaseAction } from '@ansyn/menu-items';

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
