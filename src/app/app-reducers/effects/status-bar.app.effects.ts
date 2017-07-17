import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { ChangeLayoutAction, UpdateStatusFlagsAction, StatusBarActionsTypes, ToggleHistogramStatusBarAction } from '@ansyn/status-bar';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { ICasesState,Case, defaultMapType,CaseMapState, CasesActionTypes } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import { cloneDeep , isEmpty, get } from 'lodash';
import { IStatusBarState } from '@ansyn/status-bar';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { Position } from '@ansyn/core/models/position.model';
import "@ansyn/core/utils/clone-deep";
import { UUID } from 'angular2-uuid';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { UpdateCaseAction, CopyCaseLinkAction } from '@ansyn/menu-items/cases';
import { CopySelectedCaseLinkAction, statusBarFlagsItems } from '@ansyn/status-bar';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { DisableMouseShadow, EnableMouseShadow, StopMouseShadow } from '@ansyn/menu-items/tools';
import { BackToWorldAction, ToggleHistogramAction } from '@ansyn/map-facade/actions/map.actions';
import { GoNextDisplayAction, GoPrevDisplayAction } from '@ansyn/overlays/actions/overlays.actions';
import { MapsLayout } from '@ansyn/core';
import { SetGeoFilterAction, SetOrientationAction } from '../../packages/status-bar/actions/status-bar.actions';

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
	onCopySelectedCaseLink$ = this.actions$
		.ofType(StatusBarActionsTypes.COPY_SELECTED_CASE_LINK)
		.withLatestFrom(this.store.select('cases'), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
			return state.selected_case.id
		})
		.map( (case_id: string) => {
			return new CopyCaseLinkAction(case_id)
		});


	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState): Case => state.selected_case)
		.filter((selected_case) => !isEmpty(selected_case))
		.cloneDeep()
		.mergeMap( (selected_case: Case) =>  {
			const layouts_index = selected_case.state.maps.layouts_index;
			return [
				new ChangeLayoutAction(+layouts_index),
				new SetOrientationAction(selected_case.state.orientation),
				new SetGeoFilterAction(selected_case.state.geoFilter)
			];
		});

	@Effect()
	statusBarChanges$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.SET_ORIENTATION, StatusBarActionsTypes.SET_GEO_FILTER)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState): any[] => [action, state.selected_case])
		.filter(([action, selected_case]) => !isEmpty(selected_case))
		.map(([action, selected_case]: [SetOrientationAction | SetGeoFilterAction , Case]) =>  {
			const updatedCase = cloneDeep(selected_case);
			if(action instanceof SetOrientationAction) {
				updatedCase.state.orientation = action.payload;
			}
			if(action instanceof SetGeoFilterAction) {
				updatedCase.state.geoFilter = action.payload;
			}
			return new UpdateCaseAction(updatedCase);
		});


	//move this to map-facade package and create all the login in the server
	//as metter of conceren the status bar app effects does not need to include any logic just pass
	//the actioin to the correct reference (I don't think it should be an independed package at all it should be part of ״scope" functionality)
	@Effect()
	onLayoutsChange$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store, (action: ChangeLayoutAction, state: IAppState): [ChangeLayoutAction, Case, MapsLayout]  => {
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
                actionsList.push(new UpdateMapSizeAction());

                if(selected_case.state.maps.data.length === 1){
                    actionsList.push(new DisableMouseShadow());
                    actionsList.push(new StopMouseShadow());
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

	@Effect()
	onBackToWorldView$: Observable<BackToWorldAction> = this.actions$
		.ofType(StatusBarActionsTypes.BACK_TO_WORLD_VIEW)
		.map(() => {
			return new BackToWorldAction();
		});

		@Effect()
	onToggleHistogram$: Observable<ToggleHistogramAction> = this.actions$
		.ofType(StatusBarActionsTypes.TOGGLE_HISTOGRAM_STATUS_BAR)
		.map((action: ToggleHistogramStatusBarAction) => {
			return new ToggleHistogramAction({mapId: undefined});
		});

	@Effect({dispatch: false})
	onFavorite$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.FAVORITE)
		.map(() => {
			console.log("onFavorite$");
		});


	@Effect({dispatch: false})
	onExpand$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.EXPAND)
		.map(() => {
			console.log("onExpand$");
		});


	@Effect()
	onGoPrevNext$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.GO_NEXT, StatusBarActionsTypes.GO_PREV)
		.withLatestFrom(this.store.select('cases'), (action, casesState: ICasesState) => {
			const activeMap = casesState.selected_case.state.maps.data.find(map => casesState.selected_case.state.maps.active_map_id== map.id);
			const overlayId = get(activeMap.data.overlay, "id");
			return [action.type, overlayId];
		})
		.filter(([actionType, overlayId]) => {
			return !isEmpty(overlayId);
		})
		.map(([actionType, currentOverlayId]: [string, string]) => {
			switch (actionType) {
				case StatusBarActionsTypes.GO_NEXT:
					return new GoNextDisplayAction(currentOverlayId);
				case StatusBarActionsTypes.GO_PREV:
					return new GoPrevDisplayAction(currentOverlayId);
			}
		});

	createCopyMap(index, position: Position): CaseMapState {
		// TODO: Need to get the real map Type from store instead of default map
		const mapStateCopy: CaseMapState = {id: UUID.UUID(), data:{position}, mapType: defaultMapType};
		return mapStateCopy;


	}
}
