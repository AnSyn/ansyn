import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from '@ansyn/core';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs/Subject';
import { Overlay } from '@ansyn/core/models';
import { LoadOverlaysSuccessAction } from '@ansyn/overlays';
import { SetTimelineStateAction } from '@ansyn/overlays/actions/overlays.actions';

@Injectable()
export class AnsynApi {


	shadowMouseProducer$ = new Subject();

	// @Effect()
	// onStartMapShadow$: Observable<any> = this.actions$
	// 	.ofType<EmitMouseShadowProducers>(ToolsActionsTypes.EMIT_MOUSESHADOW_PRODUCER)
	// 	.take(1)
	// 	.do(({ payload }: EmitMouseShadowProducers) => {
	// 		payload.shadowMouseProducer.subscribe(content => {
	// 				console.log(content)
	// 				this.shadowMouseProducer$.next(content)
	// 		});
	// 		console.log(payload.shadowMouseProducer)
	// 	});

	constructor(public store: Store<any>, protected actions$: Actions) {
		// this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeMapLayout(layout) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	changeWindowLayout(windowLayout: WindowLayout) {
		this.store.dispatch(new SetWindowLayout({ windowLayout }));
	}

	setOverlayes(overlays: Overlay[]) {

		this.store.dispatch(new SetTimelineStateAction({ state: this.getOverlayTimeFrame(overlays) }));
		this.store.dispatch(new LoadOverlaysSuccessAction({ overlays, refresh: true }));

	}

	private getOverlayTimeFrame(overlays: Overlay[]): { from: Date, to: Date } {
		let minDate = new Date(overlays[0].date).getTime();
		let maxDate = new Date(overlays[0].date).getTime();
		overlays.forEach(overlay => {
			const overlayDate = new Date(overlay.date).getTime();
			if (overlayDate > maxDate) {
				maxDate = overlayDate;
			}
			else if (overlayDate < minDate) {
				minDate = overlayDate;
			}
		});
		const margin = (maxDate - minDate) / 10;

		return {
			from: new Date(minDate - margin),
			to: new Date(maxDate + margin)
		};
	}


}
