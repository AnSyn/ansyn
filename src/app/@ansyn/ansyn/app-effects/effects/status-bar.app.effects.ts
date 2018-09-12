import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import {
	CopySelectedCaseLinkAction,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '@ansyn/status-bar';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import { OverlaysService } from '@ansyn/overlays';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items';
import { CopyCaseLinkAction } from '@ansyn/menu-items';
import { ClickOutsideMap, ContextMenuShowAction, MapActionTypes } from '@ansyn/map-facade';
import { selectGeoFilterSearchMode } from '@ansyn/status-bar';
import { SearchModeEnum } from '@ansyn/status-bar';
import { filter, map, withLatestFrom } from 'rxjs/operators';


@Injectable()
export class StatusBarAppEffects {


	@Effect()
	onCopySelectedCaseLink$ = this.actions$.pipe(
		ofType<CopySelectedCaseLinkAction>(StatusBarActionsTypes.COPY_SELECTED_CASE_LINK),
		withLatestFrom(this.store.select(casesStateSelector), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
			return state.selectedCase.id;
		}),
		map((caseId: string) => {
			return new CopyCaseLinkAction({ caseId: caseId, shareCaseAsQueryParams: true });
		})
	);


	@Effect({ dispatch: false })
	onExpand$: Observable<void> = this.actions$.pipe(
		ofType(StatusBarActionsTypes.EXPAND),
		map(() => {
			console.log('onExpand$');
		})
	);

	@Effect()
	onClickOutsideMap$ = this.actions$.pipe(
		ofType<ClickOutsideMap | ContextMenuShowAction>(MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP, MapActionTypes.CONTEXT_MENU.SHOW),
		withLatestFrom(this.store.select(selectGeoFilterSearchMode)),
		filter(([action, searchMode]) => searchMode !== SearchModeEnum.none),
		map(() => new UpdateGeoFilterStatus())
	);

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				public overlaysService: OverlaysService) {
	}

}
