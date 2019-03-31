import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { OverlaysService } from '../../modules/overlays/public_api';
import { casesStateSelector, ICasesState } from '../../modules/menu-items/cases/reducers/cases.reducer';
import { ClickOutsideMap, ContextMenuShowAction, MapActionTypes } from '@ansyn/map-facade';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import {
	CopySelectedCaseLinkAction,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '../../modules/status-bar/actions/status-bar.actions';
import { SearchModeEnum } from '../../modules/status-bar/models/search-mode.enum';
import { selectGeoFilterSearchMode } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CopyCaseLinkAction } from '../../modules/menu-items/cases/actions/cases.actions';


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
