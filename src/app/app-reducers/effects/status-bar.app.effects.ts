import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { ChangeLayoutAction, StatusBarActionsTypes } from '@ansyn/status-bar/actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { CasesActionTypes, UpdateCaseSuccessAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import 'rxjs/add/operator/withLatestFrom';
import * as _ from 'lodash';
import { MapsLayout } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { MapState, defaultMapType } from '@ansyn/menu-items/cases/models/map-state.model';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { Position } from '@ansyn/core/models/position.model';
import "@ansyn/core/utils/clone-deep";



@Injectable()
export class StatusBarAppEffects {

	constructor(private actions$: Actions, private store:Store<IAppState>, private casesService: CasesService) {}

	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState): Case => state.selected_case)
		.cloneDeep()
		.map( (selected_case: Case) =>  {
			const layouts_index = selected_case.state.maps.layouts_index;
			return new ChangeLayoutAction(+layouts_index)
		});

	@Effect()
	onLayoutsChange$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store, (action, state: IAppState): [ChangeLayoutAction, Case, MapsLayout]  => {
			const selected_case = state.cases.selected_case;
			const selected_layout = _.cloneDeep(state.status_bar.layouts[state.status_bar.selected_layout_index]);
			return [action, selected_case, selected_layout]
		})
		.filter(([action, selected_case, selected_layout]) => !_.isEmpty(selected_case))
		.cloneDeep()
		.switchMap(
			([action, selected_case, selected_layout]: [ChangeLayoutAction, Case, MapsLayout]  ) => {

				selected_case.state.maps.layouts_index = action.payload;
				selected_case = this.setMapsDataChanges(selected_case, selected_layout);

				return this.casesService.updateCase(selected_case).mergeMap( (updated_case) => {
					return [new UpdateCaseSuccessAction(updated_case), new UpdateMapSizeAction()];
				});
			})
		.share();

	setMapsDataChanges(selected_case: Case, selected_layout: MapsLayout): Case {
		const case_maps_count = selected_case.state.maps.data.length;
		if(selected_layout.maps_count !== case_maps_count){
			if(case_maps_count < selected_layout.maps_count){
				for (let i = case_maps_count; i < selected_layout.maps_count; i++) {
					const active_map_position = _.cloneDeep(selected_case.state.maps.data.find((map) => map.id ===  selected_case.state.maps.active_map_id).data.position);
					selected_case.state.maps.data.push(this.createCopyMap(i + 1, active_map_position))
				}
			} else if( selected_layout.maps_count < case_maps_count){
				for (let i = selected_layout.maps_count; i < case_maps_count; i++){
					selected_case.state.maps.data.pop();
				}
				const exist = selected_case.state.maps.data.find((map) => map.id ===  selected_case.state.maps.active_map_id);
				if(!exist) selected_case.state.maps.active_map_id = selected_case.state.maps.data[selected_case.state.maps.data.length - 1].id;
			}
		}
		return selected_case;
	}

	createCopyMap(index, position: Position): MapState {
		// TODO: Need to get the real map Type from store instead of default map
		const mapStateCopy: MapState = {id: `imagery${index}`, data:{position}, mapType: defaultMapType};
		return mapStateCopy;
	}
}
