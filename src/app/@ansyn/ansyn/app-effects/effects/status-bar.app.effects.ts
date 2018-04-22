import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	CopySelectedCaseLinkAction, IStatusBarState, StatusBarActionsTypes, statusBarFlagsItemsEnum, statusBarStateSelector,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { CopyCaseLinkAction, ICasesState } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import '@ansyn/core/utils/clone-deep';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { ClickOutsideMap, MapActionTypes } from '@ansyn/map-facade';


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
		.filter(([{ payload }]) => !payload.path.some((element) => element.id === 'editGeoFilter'))
		.map(([action, flags]) => new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
