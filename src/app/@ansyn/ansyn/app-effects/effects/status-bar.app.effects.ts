import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	CopySelectedCaseLinkAction, StatusBarActionsTypes,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar/actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import '@ansyn/core/utils/clone-deep';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CopyCaseLinkAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ClickOutsideMap, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';


@Injectable()
export class StatusBarAppEffects {


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
	 * @name onClickOutsideMap$
	 * @ofType ClickOutsideMap
	 * @action UpdateStatusFlagsAction
	 */
	@Effect()
	onClickOutsideMap$ = this.actions$
		.ofType<ClickOutsideMap>(MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP)
		.withLatestFrom(this.store.select(statusBarStateSelector).pluck<IStatusBarState, any>('flags'))
		.filter(([action, flags]) => flags.get(statusBarFlagsItemsEnum.geoFilterSearch))
		.filter(([{ payload }]) => !payload.path.some((element) => element.id === 'editGeoFilter' || element.id  === 'contextGeoFilter'))
		.map(() => new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
