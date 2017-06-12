import { ImageryCommunicatorService } from '@ansyn/imagery';
import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes, LoadOverlaysAction, SelectOverlayAction, UnSelectOverlayAction } from '@ansyn/overlays';
import { CasesService } from '@ansyn/menu-items/cases';
import { ICasesState } from '@ansyn/menu-items/cases';
import { Case } from '@ansyn/menu-items/cases';
import { UpdateCaseSuccessAction, CasesActionTypes, AddCaseAction } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';


import '@ansyn/core/utils/debug';
import { MapActionTypes, PositionChangedAction } from '@ansyn/map-facade/actions/map.actions';

import { IAppState } from '../';
import { isEmpty } from 'lodash';
import "@ansyn/core/utils/clone-deep";
import { Router } from '@angular/router';
import { SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { UpdateCaseAction } from '../../packages/menu-items/cases/actions/cases.actions';

@Injectable()
export class CasesAppEffects {

	@Effect()
	selectOverlay$: Observable<UpdateCaseAction> = this.actions$
		.ofType(OverlaysActionTypes.SELECT_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [SelectOverlayAction, ICasesState]) => !isEmpty(state.selected_case))
		.cloneDeep()
		.map(([action, state]: [SelectOverlayAction, ICasesState]) => {
			const selected_case: Case = state.selected_case;

			if (!selected_case.state.selected_overlays_ids) {
				selected_case.state.selected_overlays_ids = [];
			}

			let exist = selected_case.state.selected_overlays_ids.find((value) => value === action.payload);

			if (!exist) {
				selected_case.state.selected_overlays_ids.push(action.payload);
			}
			return new UpdateCaseAction(selected_case);
		});

	@Effect()
	unSelectOverlay$: Observable<UpdateCaseAction> = this.actions$
		.ofType(OverlaysActionTypes.UNSELECT_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [SelectOverlayAction, ICasesState]) => !isEmpty(state.selected_case))
		.cloneDeep()
		.map(([action, state]: [UnSelectOverlayAction, ICasesState]) => {
			const selected_case: Case = state.selected_case;

			if (!selected_case.state.selected_overlays_ids) {
				selected_case.state.selected_overlays_ids = [];
			}

			const exist_index = selected_case.state.selected_overlays_ids.findIndex((value) => value === action.payload);

			if (exist_index !== -1) {
				selected_case.state.selected_overlays_ids.splice(exist_index, 1);
			}
			return new UpdateCaseAction(selected_case);
		});


	@Effect()
	selectCase$: Observable<LoadOverlaysAction | void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => !isEmpty(state.selected_case))
		.map(([caseId, state]: [string, ICasesState]) => {
			const caseSelected: Case = state.selected_case;
 
			const overlayFilter = {
				to: caseSelected.state.time.to,
				from: caseSelected.state.time.from,
				polygon: caseSelected.state.region,
				caseId: caseId
			}
			return new LoadOverlaysAction(overlayFilter);

		})


	@Effect({ dispatch: false })
	selectCaseUpdateRouter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.filter(action => !isEmpty(action))
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [SelectCaseByIdAction, ICasesState]) => {
			if (state.default_case && action.payload === state.default_case.id) {
			return this.router.navigate(['', '']);
			}

			return this.router.navigate(['', action.payload]);
		});

	@Effect()
	saveDefaultCase$: Observable<AddCaseAction> = this.actions$
		.ofType(CasesActionTypes.SAVE_DEFAULT_CASE)
		.map(toPayload)
		.map((default_case: Case) => {
			
			this.casesService.enhanceDefaultCase(default_case);
			default_case.owner = "Default Owner"; //TODO: replace with id from authentication service

			return new AddCaseAction(default_case);
		});

	constructor(private actions$: Actions,
		private store$: Store<IAppState>,
		private casesService: CasesService,
		private router: Router) { }

}
