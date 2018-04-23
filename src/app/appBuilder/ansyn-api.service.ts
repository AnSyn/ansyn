import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from 'app/@ansyn/core/index';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs/Subject';
import { Overlay } from 'app/@ansyn/core/models/index';
import { LoadOverlaysSuccessAction } from 'app/@ansyn/overlays/index';
import { SetTimelineStateAction } from '@ansyn/overlays/actions/overlays.actions';
import { TimelineRange } from '@ansyn/overlays/reducers/overlays.reducer';
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
