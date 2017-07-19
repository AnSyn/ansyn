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
import { OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';

@Injectable()
export class CasesAppEffects {

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$)
		.mergeMap(([action, state]:[DisplayOverlayAction, IAppState]) => {

			const selectedCase = cloneDeep(state.cases.selected_case);
			const overlay: Overlay = state.overlays.overlays.get(action.payload.id) as any;
			const mapId = action.payload.map_id || state.cases.selected_case.state.maps.active_map_id;

			selectedCase.state.maps.data.forEach((map) => {
				if(mapId == map.id){
					map.data.overlay = overlay;
				}
			});

			return[
				new UpdateCaseAction(selectedCase),
				new OverlaysMarkupAction(this.casesService.getOverlaysMarkup(selectedCase))
			];

		}).share();

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
