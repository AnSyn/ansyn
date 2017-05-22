import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { ChangeLayoutAction, StatusBarActionsTypes } from '@ansyn/status-bar/actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { ICasesState } from '../../packages/menu-items/cases/reducers/cases.reducer';
import { Case } from '../../packages/menu-items/cases/models/case.model';
import { CasesActionTypes, UpdateCaseSuccessAction } from '../../packages/menu-items/cases/actions/cases.actions';
import { CasesService } from '../../packages/menu-items/cases/services/cases.service';
import 'rxjs/add/operator/withLatestFrom';
import * as _ from 'lodash';
import { MapsLayout } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { MapState } from '@ansyn/menu-items/cases/models/map-state.model';
import { UpdateMapSizeAction } from '../../packages/map-facade/actions/map.actions';
import { MapFacadeService } from '../../packages/map-facade/services/map-facade.service';

@Injectable()
export class StatusBarAppEffects {

	constructor(private actions$: Actions, private store:Store<IAppState>, private casesService: CasesService) {}
	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store.select("cases"), (action, state: ICasesState): Case => _.cloneDeep(state.cases[state.selected_case.index]))
		.map( (selected_case: Case) =>  {
			const layouts_index = selected_case.state.maps.layouts_index;
			return new ChangeLayoutAction(+layouts_index)
		});

	@Effect()
	onLayoutsChange$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store, (action, state: IAppState): [ChangeLayoutAction, Case, MapsLayout, MapsLayout]  => {
			const selected_case = state.cases.cases[state.cases.selected_case.index];
			const selected_layout = state.status_bar.layouts[state.status_bar.selected_layout_index];
			const selected_case_layout = state.status_bar.layouts[selected_case.state.maps.layouts_index];
			return [action, selected_case, selected_case_layout, selected_layout]
		})
		.switchMap(
			([action, selected_case, selected_case_layout, selected_layout]: [ChangeLayoutAction, Case, MapsLayout, MapsLayout]  ) => {

				if(!selected_case){
					return Observable.empty();
				}

				selected_case.state.maps.layouts_index = action.payload;

				if(selected_case_layout.maps_count !== selected_layout.maps_count){
					if(selected_case_layout.maps_count < selected_layout.maps_count){
						for (let i = selected_case_layout.maps_count; i < selected_layout.maps_count; i++){
							selected_case.state.maps.data.push(this.getMapWithId(i + 1))
						}
					} else if(selected_case_layout.maps_count > selected_layout.maps_count){
						for (let i = selected_layout.maps_count; i < selected_case_layout.maps_count; i++){
							selected_case.state.maps.data.pop();
						}
					}
				}

				return this.casesService.updateCase(selected_case).map( (updated_case) => {
					return new UpdateCaseSuccessAction(updated_case);
				});
			})
		.mergeMap((updateCaseSuccessAction:UpdateCaseSuccessAction) => {
			return [updateCaseSuccessAction, new UpdateMapSizeAction()];
		})
		.share();

	getMapWithId(index): MapState {
		return {
			id: `imagery${index}`,
			settings: [
				{
					"mapType": "openLayerMap",
					"mapModes": []
				}
			],
			data:{
				position:{
					zoom: 0,
					rotation: 0,
					center: {
						type: "Point",
						coordinates: [
							0,
							0
						]
					},
				}
			}
		}
	}
	getMapsViaCount(state) {

		switch (state) {
			case 0:
				return [ this.getMapWithId(1) ];
			case 1:
			case 2:
				return [ this.getMapWithId(1), this.getMapWithId(2) ];
			case 3:
			case 4:
				return [ this.getMapWithId(1), this.getMapWithId(2), this.getMapWithId(3) ];
			case 5:
				return [ this.getMapWithId(1), this.getMapWithId(2), this.getMapWithId(3), this.getMapWithId(4) ];
		}

	}
}
