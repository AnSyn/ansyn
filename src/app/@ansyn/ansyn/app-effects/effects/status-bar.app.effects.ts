import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	CopySelectedCaseLinkAction, IStatusBarState, StatusBarActionsTypes, statusBarFlagsItems,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { CopyCaseLinkAction, ICasesState } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import '@ansyn/core/utils/clone-deep';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { DrawPinPointAction, PinPointModeTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import { getPointByGeometry } from '@ansyn/core/utils/geo';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';


@Injectable()
export class StatusBarAppEffects {

	/**
	 * @type Effect
	 * @name updatePinPointSearchAction$
	 * @ofType UpdateStatusFlagsAction
	 * @dependencies statusBar
	 * @filter update pinPointSearch and in pinPointSearch
	 * @description
	 * add click event to map (for searching overlay according to pin point on click)
	 */
	@Effect({ dispatch: false })
	updatePinPointSearchAction$: Observable<void> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select(statusBarStateSelector))
		.filter(([action, statusBarState]: [UpdateStatusFlagsAction, IStatusBarState]) => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(() => {
			this.imageryCommunicator.communicatorsAsArray().forEach(communicator => {
				communicator.createMapSingleClickEvent();
			});
		});

	/**
	 * @type Effect
	 * @name updatePinPointIndicatorAction$
	 * @ofType UpdateStatusFlagsAction
	 * @dependencies statusBar, cases
	 * @filter update pinPointIndicator and has casesState.selectedCase
	 * @actions DrawPinPointAction
	 */
	@Effect()
	updatePinPointIndicatorAction$: Observable<DrawPinPointAction> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointIndicator)
		.withLatestFrom(this.store.select(statusBarStateSelector), this.store.select(casesStateSelector))
		.filter(([action, statusBarState, casesState]) => Boolean(casesState.selectedCase))
		.map(([action, statusBarState, casesState]: [UpdateStatusFlagsAction, IStatusBarState, ICasesState]) => {
			let coordinates = null;
			if (statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
				coordinates = getPointByGeometry(casesState.selectedCase.state.region).coordinates;
			}
			return new DrawPinPointAction(coordinates);
		});

	/**
	 * @type Effect
	 * @name onCopySelectedCaseLink$
	 * @ofType CopySelectedCaseLinkAction
	 * @dependencies cases
	 * @action CopyCaseLinkAction
	 */
	@Effect()
	onCopySelectedCaseLink$ = this.actions$
		.ofType<CopySelectedCaseLinkAction>(StatusBarActionsTypes.COPY_SELECTED_CASE_LINK)
		.withLatestFrom(this.store.select(casesStateSelector), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
			return state.selectedCase.id;
		})
		.map((caseId: string) => {
			return new CopyCaseLinkAction({ caseId: caseId, shareCaseAsQueryParams: true });
		});


	/**
	 * @type Effect
	 * @name onExpand$
	 * @ofType ExpandAction
	 */
	@Effect({ dispatch: false })
	onExpand$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.EXPAND)
		.map(() => {
			console.log('onExpand$');
		});

	/**
	 * @type Effect
	 * @name updatePinPointModeAction$
	 * @ofType UpdateStatusFlagsAction
	 * @dependencies statusBar
	 * @filter is action pinPointSearch
	 * @action PinPointModeTriggerAction
	 */
	@Effect()
	updatePinPointModeAction$: Observable<PinPointModeTriggerAction> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select(statusBarStateSelector).pluck<IStatusBarState, Map<string, boolean>>('flags'))
		.map(([action, flags]: [any, Map<string, boolean>]) => flags.get(statusBarFlagsItems.pinPointSearch))
		.map((value: boolean) => new PinPointModeTriggerAction(value));


	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				public imageryCommunicator: ImageryCommunicatorService,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
