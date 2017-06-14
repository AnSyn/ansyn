import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes, LoadOverlaysAction, SelectOverlayAction, UnSelectOverlayAction } from '@ansyn/overlays';
import { CasesService } from '@ansyn/menu-items/cases';
import { ICasesState } from '@ansyn/menu-items/cases';
import { Case } from '@ansyn/menu-items/cases';
import { CasesActionTypes, AddCaseAction } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import { isEmpty, cloneDeep } from 'lodash';
import "@ansyn/core/utils/clone-deep";
import { Router } from '@angular/router';
import { SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { UpdateCaseAction } from '../../packages/menu-items/cases/actions/cases.actions';
import { Overlay } from '../../packages/overlays/models/overlay.model';
import { CaseMapState } from '../../packages/menu-items/cases/models/case.model';
import { DisplayOverlayAction } from '../../packages/overlays/actions/overlays.actions';

@Injectable()
export class CasesAppEffects {
	
	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$)
		.filter(([action, state]:[DisplayOverlayAction, IAppState]) => true)
		.map(([action, state]:[DisplayOverlayAction, IAppState]) => {
			const selected_case: Case = cloneDeep(state.cases.selected_case);
			const selected_overlay: Overlay = state.overlays.overlays.get(action.payload.id);
			const map_id = action.payload.map_id ? action.payload.map_id : state.cases.selected_case.state.maps.active_map_id;
			const map = selected_case.state.maps.data.find((map) => map_id == map.id);
			map.data.selectedOverlay = {id: selected_overlay.id, name: selected_overlay.name, imageUrl: selected_overlay.imageUrl, sourceType: selected_overlay.sourceType};
			return new UpdateCaseAction(selected_case);
		});	
	
	/*  
	// displaySelectedOverlay$ effect will display overlays from selected case.
	@Effect()

	displaySelectedOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$)
		.filter(([action, state]:[any, IAppState]) => true)
		.mergeMap(([action, state]:[any, IAppState]) => {
			const selected_case: Case = state.cases.selected_case;
			const displayed_overlays = selected_case
				.state.maps.data
				.filter((map: CaseMapState) => map.data.selectedOverlay)
				.map((map: CaseMapState) => {
				return {id: map.data.selectedOverlay.id, map_id: map.id}
			});
			const result = displayed_overlays.map( overlayIdMapId => new DisplayOverlayAction(overlayIdMapId));
			console.log(result)
			return result;
		});
	*/

	//@todo move this to overlays.app.effects	
	@Effect()
	selectCase$: Observable<LoadOverlaysAction | void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => {
			return !isEmpty(state.selected_case);
		})
		.map(([caseId, state]: [string, ICasesState]) => {
			const caseSelected: Case = state.selected_case;

			const overlayFilter = {
				to: caseSelected.state.time.to,
				from: caseSelected.state.time.from,
				polygon: caseSelected.state.region,
				caseId: caseId
			};
			return new LoadOverlaysAction(overlayFilter);

		});

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
				private router: Router){ }

}
