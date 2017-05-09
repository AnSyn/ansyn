import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../app.reducers.module';
import * as turf from '@turf/turf';


import { ActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { IOverlayState} from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/api/imageryCommunicatorService';

import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class MapAppEffects {

	constructor(private actions$: Actions, private store$: Store<IAppState>, private communicator: ImageryCommunicatorService) {
		// code...
		//
	}

	@Effect({dispatch: false})
	selectOverlay$: Observable<Action> = this.actions$
		.ofType(ActionTypes.SELECT_OVERLAY)
		.map(toPayload)
		.withLatestFrom(this.store$.select('overlays'), (overlayId: string, store: IOverlayState ) => {
			return store.overlays.get(overlayId);
		})
		.switchMap( (overlay: Overlay) => {
			const center: any = turf.center(overlay.footprint);
			this.communicator.provideCommunicator('imagery1').setCenter(center.geometry);
			return Observable.empty();
		});


}
