import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { LayersActionTypes, SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { IAppState } from '../';
import * as turf from '@turf/turf';
import 'rxjs/add/operator/withLatestFrom';
import { MapActionTypes, PositionChangedAction,StartMapShadowAction ,StopMapShadowAction  } from '@ansyn/map-facade/actions/map.actions';
import { Case, ICasesState, CasesService, UpdateCaseSuccessAction } from '@ansyn/menu-items/cases';
import { BaseSourceProvider } from '@ansyn/imagery';
import { isEmpty } from 'lodash';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools'; 

import '@ansyn/core/utils/clone-deep';
import { TypeContainerService } from "@ansyn/type-container";
import { DisplayOverlayAction } from '../../packages/overlays/actions/overlays.actions';

@Injectable()
export class MapAppEffects {

	@Effect()
	onStartMapShadow$: Observable<StartMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
		.debug('map app effects start')
		.map(() => new StartMapShadowAction());
		
	@Effect()
	onEndMapShadow$: Observable<StopMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.STOP_MOUSE_SHADOW)
		.debug('map app effects stop')
		.map(() => new StopMapShadowAction());


	@Effect({ dispatch: false })
	selectOverlay$: Observable<Action> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$, (action: DisplayOverlayAction, store: IAppState) => {
			const overlay = store.overlays.overlays.get(action.payload.id);
			const map_id = action.payload.map_id ? action.payload.map_id : store.cases.selected_case.state.maps.active_map_id;
			return [overlay, map_id];
		})
		.switchMap( ([overlay, map_id]:[Overlay, string]) => {
			const footprintFeature: GeoJSON.Feature<any> = {
				"type": 'Feature',
				"properties": {},
				"geometry": overlay.footprint
			};
			const center = turf.center(footprintFeature);
			const bbox = turf.bbox(footprintFeature);
			const bboxPolygon = turf.bboxPolygon(bbox);
			const extent = {topLeft: bboxPolygon.geometry.coordinates[0][0], topRight: bboxPolygon.geometry.coordinates[0][1], bottomLeft: bboxPolygon.geometry.coordinates[0][2], bottomRight:bboxPolygon.geometry.coordinates[0][3]};
			const mapType = this.communicator.provideCommunicator(map_id).ActiveMap.mapType;
			const sourceLoader = this.typeContainerService.resolve(BaseSourceProvider,[mapType, overlay.sourceType].join(','));
			sourceLoader.createAsync(overlay).then((layer)=> {
				this.communicator.provideCommunicator(map_id).setLayer(layer, extent);
				this.communicator.provideCommunicator(map_id).setCenter(center.geometry);
			});

			return Observable.empty();
		});

	@Effect({ dispatch: false })
	addVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.SELECT_LAYER)
		.withLatestFrom(this.store$.select("cases"))
		.map(([action, state]: [SelectLayerAction, ICasesState]) => {
			return [action, state.selected_case.state.maps.active_map_id];
		})
		.map(([action, active_map_id]: [SelectLayerAction, string]) => {
			const imagery = this.communicator.provideCommunicator(active_map_id);
			imagery.addVectorLayer(action.payload);
		}).share();

	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [UnselectLayerAction, ICasesState])=> [action, state.selected_case.state.maps.active_map_id])
		.map(([action, active_map_id]: [UnselectLayerAction, string]) => {
			let imagery = this.communicator.provideCommunicator(active_map_id);
			imagery.removeVectorLayer(action.payload);
		}).share();

	@Effect()
	positionChanged$: Observable<UpdateCaseSuccessAction> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [PositionChangedAction, ICasesState]) => !isEmpty(state.selected_case))
		.cloneDeep()
		.switchMap( ([action, state]: [PositionChangedAction, ICasesState]) => {
			const selected_case: Case = state.selected_case;
			const selected_map_index = selected_case.state.maps.data.findIndex((map) => map.id === action.payload.id);
			const selected_map = selected_case.state.maps.data[selected_map_index];
			selected_map.data.position = action.payload.position;
			selected_case.state.maps.data[selected_map_index] = selected_map;

			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});

	constructor(
		private actions$: Actions,
		private casesService: CasesService,
		private store$: Store<IAppState>,
		private communicator: ImageryCommunicatorService,
		private typeContainerService: TypeContainerService
	) { }
}
