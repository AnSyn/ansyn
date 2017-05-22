import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/api/imageryCommunicator.service';
import { Case, ICasesState, CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases';
import { MapSourceProviderContainerService } from '@ansyn/map-source-provider';
import { LayersActionTypes, SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { IAppState } from '../';
import * as turf from '@turf/turf';
import 'rxjs/add/operator/withLatestFrom';
import { UpdateCaseSuccessAction } from '../../packages/menu-items/cases/actions/cases.actions';
import { MapActionTypes, PositionChangedAction } from '../../packages/map-facade/actions/map.actions';

@Injectable()
export class MapAppEffects {

	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>,
		private communicator: ImageryCommunicatorService,
		private mapSourceProviderContainerService: MapSourceProviderContainerService
		) { }

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
			const mapType =this.communicator.provideCommunicator('imagery1').getActiveMapObject().mapType;
			const layer = this.mapSourceProviderContainerService.resolve(mapType,overlay.sourceType).create(overlay);
			this.communicator.provideCommunicator('imagery1').setLayer(layer);
			return Observable.empty();
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

	@Effect()
	positionChanged$: Observable<UpdateCaseSuccessAction> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select('cases'))
		.switchMap( ([action, state]: [PositionChangedAction, ICasesState]) => {
			const selected_case: Case = state.cases[state.selected_case.index];
			if(!selected_case){
				return Observable.empty()
			}
			const selected_map = selected_case.state.maps.data.find((map) => map.id == action.payload.id);
			selected_map.data.position = action.payload.position;

			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});

	// @Effect({ dispatch: false })
	// selectCase$: Observable<void> = this.actions$
	// 	.ofType(CasesActionTypes.SELECT_CASE)
	// 	.withLatestFrom(this.store$.select('cases'), (action: SelectCaseAction, store: ICasesState) => store.cases[action.payload.index])
	// 	.map((selected_case: Case): void => {
	// 		let imagery = this.communicator.provideCommunicator('imagery1');
	// 		if (selected_case.state.maps.data) {
	// 			imagery.setPosition(selected_case.state.maps.data[0].data.position);
	// 		}
	// 	});
}
