import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadDefaultCaseAction } from '@ansyn/menu-items';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from '@ansyn/core';

@Injectable()
export class AnsynApi {

	constructor(public store: Store<any>) {
		// this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeMapLayout(layout) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	changeWindowLayout(windowLayout : WindowLayout) {
		this.store.dispatch((new SetWindowLayout({windowLayout})))
	}


}
