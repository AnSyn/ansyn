import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app.reducers.module';
import { Observable } from 'rxjs';
import { OverlaysActionTypes, SelectOverlayAction  } from '@ansyn/overlays/actions/overlays.actions';
import { CasesService } from '@ansyn/menu-items/cases';
import { ICasesState } from '@ansyn/menu-items/cases';
import { Case } from '@ansyn/menu-items/cases';
import { UpdateCaseSuccessAction } from '@ansyn/menu-items/cases';
import { MapActionTypes, PositionChangedAction } from '../packages/map-facade/actions/map.actions';
import 'rxjs/add/operator/withLatestFrom';
import { UnSelectOverlayAction } from '../packages/overlays/actions/overlays.actions';

@Injectable()
export class CasesAppEffects {

	constructor(private actions$: Actions, private store$: Store<IAppState>, private casesService: CasesService) {}

	@Effect()
	selectOverlay$: Observable<UpdateCaseSuccessAction> = this.actions$
		.ofType(OverlaysActionTypes.SELECT_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.switchMap( ([action, state]: [SelectOverlayAction, ICasesState]) => {
			const selected_case: Case = state.cases.find((case_value) =>  case_value.id == state.selected_case_id);

			if(!selected_case) {
				return Observable.empty();
			}

			if(!selected_case.state.selected_overlays_ids){
				selected_case.state.selected_overlays_ids = [];
			}

			let exist = selected_case.state.selected_overlays_ids.find((value) => value == action.payload);

			if(!exist){
				selected_case.state.selected_overlays_ids.push(action.payload);
			}

			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});

	@Effect()
	unSelectOverlay$: Observable<Action> = this.actions$
		.ofType(OverlaysActionTypes.UNSELECT_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.switchMap( ([action, state]: [UnSelectOverlayAction, ICasesState]) => {
			const selected_case: Case = state.cases.find((case_value) =>  case_value.id == state.selected_case_id);
			if(!selected_case) {
				return Observable.empty();
			}

			if(!selected_case.state.selected_overlays_ids){
				selected_case.state.selected_overlays_ids = [];
			}

			const exist_index = selected_case.state.selected_overlays_ids.findIndex((value) => value == action.payload);

			if(exist_index != -1){
				selected_case.state.selected_overlays_ids.splice(exist_index, 1);
			}

			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});


	@Effect()
	positionChanged$: Observable<UpdateCaseSuccessAction> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select('cases'))
		.switchMap( ([action, state]: [PositionChangedAction, ICasesState]) => {
			const selected_case: Case = state.cases.find((case_value) =>  case_value.id == state.selected_case_id);
			if(!selected_case){
				return Observable.empty()
			}
			selected_case.state.maps = [{position: action.payload}];
			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});

}
