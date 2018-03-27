import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from '@ansyn/core';
import { Actions, Effect } from '@ngrx/effects';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { EmitMouseShadowProducers } from '@ansyn/menu-items';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Overlay } from '@ansyn/core/models';
import { LoadOverlaysSuccessAction } from '@ansyn/overlays';

@Injectable()
export class AnsynApi {


	shadowMouseProducer$ = new Subject();

	@Effect()
	onStartMapShadow$: Observable<any> = this.actions$
		.ofType<EmitMouseShadowProducers>(ToolsActionsTypes.EMIT_MOUSESHADOW_PRODUCER)
		.take(1)
		.do(({ payload }: EmitMouseShadowProducers) => {
			payload.shadowMouseProducer.subscribe(content => {
					console.log(content)
					this.shadowMouseProducer$.next(content)
			});
			console.log(payload.shadowMouseProducer)
		});

	constructor(public store: Store<any>, protected actions$: Actions) {
			// this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeMapLayout(layout) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	changeWindowLayout(windowLayout: WindowLayout) {
		this.store.dispatch(new SetWindowLayout({ windowLayout }));
	}

	setOverlayes(overlayes?: Array<Overlay>) {

		const fakeOverlay: Overlay = {
			id: '132',
			name: 'fake1',
			photoTime: '10:32',
			date: new Date(Date.now()),
			azimuth: 3.2,
			isGeoRegistered: false
		}

		this.store.dispatch(new LoadOverlaysSuccessAction([fakeOverlay]));
	}


}
