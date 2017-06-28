import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes, LoadOverlaysAction } from '@ansyn/overlays';
import { CasesService } from '@ansyn/menu-items/cases';
import { ICasesState } from '@ansyn/menu-items/cases';
import { Case } from '@ansyn/menu-items/cases';
import { CasesActionTypes, AddCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import { isEmpty, cloneDeep } from 'lodash';
import "@ansyn/core/utils/clone-deep";
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetLinkCopyToastValueAction } from '@ansyn/status-bar';
import { CopyCaseLinkAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { isNil } from 'lodash';
import { StatusBarActionsTypes } from '@ansyn/status-bar/actions/status-bar.actions';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { overlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';

@Injectable()
export class CasesAppEffects {

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$)
		.filter(([action, state]:[DisplayOverlayAction, IAppState]) => true)
		.mergeMap(([action, state]:[DisplayOverlayAction, IAppState]) => {
			const selectedCase: Case = cloneDeep(state.cases.selected_case);
			const selected_overlay: Overlay = state.overlays.overlays.get(action.payload.id);
			const map_id = action.payload.map_id ? action.payload.map_id : state.cases.selected_case.state.maps.active_map_id;
			const map = selectedCase.state.maps.data.find((map) => map_id == map.id);
			map.data.selectedOverlay = {id: selected_overlay.id, name: selected_overlay.name, imageUrl: selected_overlay.imageUrl, sourceType: selected_overlay.sourceType};

			const result :Action[] = [];
			result.push(new UpdateCaseAction(selectedCase));
			result.push(new overlaysMarkupAction(this.casesService.getOverlaysMarkup(selectedCase)));
			return result;
		});

	@Effect()
	onCopyShareCaseLink$ = this.actions$
		.ofType(CasesActionTypes.COPY_CASE_LINK)
		.withLatestFrom(this.store$.select('cases'), (action: CopyCaseLinkAction, state: ICasesState) => {
			let s_case = state.cases.find((case_value: Case) => case_value.id == action.payload);
			if(isNil(s_case)){
				if(state.selected_case.id == action.payload){
					s_case = state.selected_case;
				}
			}
			return s_case;
		})
		.map( (s_case: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(s_case);
			const result = copyFromContent(shareLink);
			return new SetLinkCopyToastValueAction(result);
		});

	@Effect({dispatch: false})
	onOpenShareLink$ = this.actions$
		.ofType(StatusBarActionsTypes.OPEN_SHARE_LINK)
		.withLatestFrom(this.store$.select('cases'), (action: CopyCaseLinkAction, state: ICasesState) => {
			return state.selected_case;
		})
		.map( (s_case: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(s_case);
			window.open(shareLink);
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
				private casesService: CasesService){ }

}
