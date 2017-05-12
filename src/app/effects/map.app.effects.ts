import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../app.reducers.module';
import { OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/api/imageryCommunicator.service';
import { Case, ICasesState, CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases';
import { LayersActionTypes, SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import * as turf from '@turf/turf';
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class MapAppEffects {

	constructor(private actions$: Actions, private store$: Store<IAppState>, private communicator: ImageryCommunicatorService) { }

	@Effect({ dispatch: false })
	selectOverlay$: Observable<Action> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.map(toPayload)
		.withLatestFrom(this.store$.select('overlays'), (overlayId: string, store: IOverlayState) => {
			return store.overlays.get(overlayId);
		})
		.switchMap((overlay: Overlay) => {
			const center: any = turf.center(overlay.footprint);
			this.communicator.provideCommunicator('imagery1').setCenter(center.geometry);
			return Observable.empty();
		});

	@Effect({ dispatch: false })
	selectCase$: Observable<void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('cases'), (action: SelectCaseAction, store: ICasesState) => store.cases.find((case_val) => case_val.id == action.payload))
		.map((selected_case: Case): void => {
			let imagery = this.communicator.provideCommunicator('imagery1');
			if (selected_case.state.maps[0].position) {
				imagery.setPosition(selected_case.state.maps[0].position);
			}
		});

	@Effect({ dispatch: false })
	addVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.SELECT_LAYER)
		.map((action: SelectLayerAction) => {
			let imagery = this.communicator.provideCommunicator('imagery1');
			imagery.addVectorLayer(action.payload);
		}).share();

	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.map((action: UnselectLayerAction) => {
			let imagery = this.communicator.provideCommunicator('imagery1');
			imagery.removeVectorLayer(action.payload);
		}).share();
}
