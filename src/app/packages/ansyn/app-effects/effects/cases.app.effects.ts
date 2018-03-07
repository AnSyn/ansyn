import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes } from '@ansyn/overlays';
import { Case, CasesActionTypes, CasesService, ICasesState } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import '@ansyn/core/utils/clone-deep';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { CopyCaseLinkAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@Injectable()
export class CasesAppEffects {

	/**
	 * @type Effect
	 * @name onDisplayOverlay$
	 * @ofType DisplayOverlayAction
	 * @action SetMapsDataActionStore
	 * @dependencies map
	 */
	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [DisplayOverlayAction, IMapState]) => {

			const updatedMapsList = [...mapState.mapsList];
			const mapId = action.payload.mapId || mapState.activeMapId;

			updatedMapsList.forEach((map) => {
				if (mapId === map.id) {
					map.data.overlay = action.payload.overlay;
				}
			});
			return new SetMapsDataActionStore({ mapsList: updatedMapsList });
		}).share();

	/**
	 * @type Effect
	 * @name onCopyShareCaseLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is true
	 * @action SetToastMessageAction
	 * @dependencies cases
	 */
	@Effect()
	onCopyShareCaseLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => Boolean(action.payload.shareCaseAsQueryParams))
		.withLatestFrom(this.store$.select(casesStateSelector), (action: CopyCaseLinkAction, state: ICasesState) => {
			let sCase = state.entities[action.payload.caseId];
			if (!sCase) {
				if (state.selectedCase.id === action.payload.caseId) {
					sCase = state.selectedCase;
				}
			}
			return sCase;
		})
		.map((sCase: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		});

	/**
	 * @type Effect
	 * @name onCopyShareCaseIdLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is false
	 * @action SetToastMessageAction
	 */
	@Effect()
	onCopyShareCaseIdLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => !Boolean(action.payload.shareCaseAsQueryParams))
		.map((action) => {
			const shareLink = this.casesService.generateLinkWithCaseId(action.payload.caseId);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
