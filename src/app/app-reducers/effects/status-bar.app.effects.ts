import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { ChangeLayoutAction, UpdateStatusFlagsAction ,StatusBarActionsTypes } from '@ansyn/status-bar';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { ICasesState,Case, defaultMapType,CaseMapState, CasesActionTypes } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import { cloneDeep , isEmpty} from 'lodash';

import { MapsLayout, IStatusBarState } from '@ansyn/status-bar';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { Position } from '@ansyn/core/models/position.model';
import "@ansyn/core/utils/clone-deep";
import { UUID } from 'angular2-uuid';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { UpdateCaseAction, ShareCaseLinkAction } from '@ansyn/menu-items/cases';
import { ShareSelectedCaseLinkAction,statusBarFlagsItems } from '@ansyn/status-bar';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { DisableMouseShadow, EnableMouseShadow, StopMouseShadow } from '@ansyn/menu-items/tools';


@Injectable()
export class StatusBarAppEffects {

	@Effect({dispatch:false})
	updatePinPointSearchAction$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action =>  action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select('status_bar'))
		.filter(([action,statusBarState]:[any,any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(() => {
			this.imageryCommunicator.communicatorsAsArray().forEach(c => {
				c.createMapSingleClickEvent();
			});
		});

	@Effect({dispatch:false})
	updatePinPointIndicatorAction$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action =>  action.payload.key === statusBarFlagsItems.pinPointIndicator)
		.withLatestFrom(this.store.select('status_bar'),this.store.select('cases'))
		.map(([action,statusBarState,casesState]:[UpdateStatusFlagsAction, IStatusBarState,ICasesState]) => {

			const value:boolean = statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator);
			this.imageryCommunicator.communicatorsAsArray().forEach(c => {
				if(value){
					const point = this.overlaysService.getPointByPolygon(casesState.selected_case.state.region);
					const latLon = point.coordinates;
					c.addPinPointIndicator(latLon);
				}else{
					c.removePinPointIndicator();
				}

			});
		});

	@Effect()
	onShareSelectedCaseLink$ = this.actions$
		.ofType(StatusBarActionsTypes.SHARE_SELECTED_CASE_LINK)
		.withLatestFrom(this.store.select('cases'), (action: ShareSelectedCaseLinkAction, state: ICasesState) => {
			return state.selected_case.id
		})
		.map( (case_id: string) => {
			return new ShareCaseLinkAction(case_id)
		});


	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState): Case => state.selected_case)
		.filter((selected_case) => !isEmpty(selected_case))
		.cloneDeep()
		.map( (selected_case: Case) =>  {
			const layouts_index = selected_case.state.maps.layouts_index;
			return new ChangeLayoutAction(+layouts_index);
		});


	//move this to map-facade package and create all the login in the server
	//as metter of conceren the status bar app effects does not need to include any logic just pass
	//the actioin to the correct reference (I don't think it should be an independed package at all it should be part of ״scope" functionality)
	@Effect()
	onLayoutsChange$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store, (action, state: IAppState): [ChangeLayoutAction, Case, MapsLayout]  => {
			const selected_case = state.cases.selected_case;
			const selected_layout = cloneDeep(state.status_bar.layouts[state.status_bar.selected_layout_index]);
			return [action, selected_case, selected_layout];
		})
		.filter(([action, selected_case, selected_layout]) => !isEmpty(selected_case))
		.cloneDeep()
		.mergeMap(([action, selected_case, selected_layout]: [ChangeLayoutAction, Case, MapsLayout]  ) => {
				selected_case.state.maps.layouts_index = action.payload;

				const updatedCase = this.setMapsDataChanges(selected_case, selected_layout);

				const actionsList: Array<Action> = [];
                actionsList.push(new UpdateCaseAction(updatedCase));
                actionsList.push(new UpdateMapSizeAction())

                if(selected_case.state.maps.data.length === 1){
                    actionsList.push(new DisableMouseShadow());
                    actionsList.push(new StopMouseShadow())
                }else{
                    actionsList.push(new EnableMouseShadow());
                }

                return actionsList;
		})
		.share();

	constructor(private actions$: Actions,
				private store:Store<IAppState>,
				public imageryCommunicator: ImageryCommunicatorService,
				public overlaysService: OverlaysService
	) {}

	setMapsDataChanges(selected_case: Case, selected_layout: MapsLayout): Case {
		const case_maps_count = selected_case.state.maps.data.length;

		if(selected_layout.maps_count !== case_maps_count){
			if(case_maps_count < selected_layout.maps_count){

				for (let i = case_maps_count; i < selected_layout.maps_count; i++) {
					const active_map_position = cloneDeep(selected_case.state.maps.data.find((map) => map.id ===  selected_case.state.maps.active_map_id).data.position);
					selected_case.state.maps.data.push(this.createCopyMap(i + 1, active_map_position));
				}
			}
			else if( selected_layout.maps_count < case_maps_count){

				for (let i = selected_layout.maps_count; i < case_maps_count; i++){
					selected_case.state.maps.data.pop();
				}

				const exist = selected_case.state.maps.data.find((map) => map.id ===  selected_case.state.maps.active_map_id);

				if(!exist) {
					selected_case.state.maps.active_map_id = selected_case.state.maps.data[selected_case.state.maps.data.length - 1].id;
				}
			}
		}
		return selected_case;
	}

	createCopyMap(index, position: Position): CaseMapState {
		// TODO: Need to get the real map Type from store instead of default map
		const mapStateCopy: CaseMapState = {id: UUID.UUID(), data:{position}, mapType: defaultMapType};
		return mapStateCopy;


	}
}
