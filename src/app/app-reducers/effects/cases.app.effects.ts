import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes,LoadOverlaysAction,SelectOverlayAction,UnSelectOverlayAction } from '@ansyn/overlays';
import { CasesService } from '@ansyn/menu-items/cases';
import { ICasesState } from '@ansyn/menu-items/cases';
import { Case } from '@ansyn/menu-items/cases';
import { UpdateCaseSuccessAction, CasesActionTypes } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import { isEmpty } from 'lodash';
import "@ansyn/core/utils/clone-deep";

@Injectable()
export class CasesAppEffects {

	@Effect()
	selectOverlay$: Observable<UpdateCaseSuccessAction> = this.actions$
		.ofType(OverlaysActionTypes.SELECT_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.cloneDeep()
		.switchMap( ([action, state]: [SelectOverlayAction, ICasesState]) => {
			const selected_case: Case = state.selected_case;

			if(!selected_case) {
				return Observable.empty();
			}

			if(!selected_case.state.selected_overlays_ids){
				selected_case.state.selected_overlays_ids = [];
			}

			let exist = selected_case.state.selected_overlays_ids.find((value) => value === action.payload);

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
		.cloneDeep()
		.switchMap( ([action, state]: [UnSelectOverlayAction, ICasesState]) => {
			const selected_case: Case = state.selected_case;

			if(!selected_case) {
				return Observable.empty();
			}

			if(!selected_case.state.selected_overlays_ids){
				selected_case.state.selected_overlays_ids = [];
			}

			const exist_index = selected_case.state.selected_overlays_ids.findIndex((value) => value === action.payload);

			if(exist_index !== -1){
				selected_case.state.selected_overlays_ids.splice(exist_index, 1);
			}

			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});


	@Effect()
	selectCase$: Observable<LoadOverlaysAction|void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => !isEmpty(state.selected_case))
		.map( ([caseId, state]: [string, ICasesState]) =>  {
			const caseSelected: Case = state.selected_case;
			const overlayFilter = {
				to: caseSelected.state.time.to,
				from: caseSelected.state.time.from,
				polygon: caseSelected.state.region,
				caseId: caseId
			};
			return new LoadOverlaysAction(overlayFilter);
		});

	constructor(private actions$: Actions, private store$: Store<IAppState>, private casesService: CasesService) {}

}
