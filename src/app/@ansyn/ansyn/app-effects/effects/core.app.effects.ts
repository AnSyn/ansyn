import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { CasesActionTypes } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import '@ansyn/core/utils/clone-deep';
import { CoreActionTypes, SetFavoriteOverlaysAction, ToggleFavoriteAction } from '@ansyn/core/actions/core.actions';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { GoAdjacentOverlay, LoggerService, SetOverlaysCriteriaAction } from '@ansyn/core';
import { LoadOverlaysAction, MarkUpClass, SetMarkUp } from '@ansyn/overlays';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';

@Injectable()
export class CoreAppEffects {
	/**
	 * @type Effect
	 * @name onFavorite$
	 * @ofType ToggleFavoriteAction
	 * @dependencies cases
	 * @action SetFavoriteOverlaysAction
	 */
	@Effect()
	onFavorite$: Observable<Action> = this.actions$
		.ofType<ToggleFavoriteAction>(CoreActionTypes.TOGGLE_OVERLAY_FAVORITE)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.map(([action, { favoriteOverlays }]: [ToggleFavoriteAction, ICoreState]) => {
			const updatedFavoriteOverlays = [...favoriteOverlays];
			const toggledFavorite = updatedFavoriteOverlays.find(o => o.id === action.payload.id);
			const indexOfPayload = updatedFavoriteOverlays.indexOf(toggledFavorite);
			if (indexOfPayload === -1) {
				updatedFavoriteOverlays.push(action.payload);
			} else {
				updatedFavoriteOverlays.splice(indexOfPayload, 1);
			}
			return new SetFavoriteOverlaysAction(updatedFavoriteOverlays);
		});

	/**
	 * @type Effect
	 * @name setFavoriteOverlaysUpdateCase$
	 * @ofType SetFavoriteOverlaysAction
	 * @action OverlaysMarkupAction
	 */
	@Effect()
	setFavoriteOverlaysUpdateCase$: Observable<any> = this.actions$
		.ofType<SetFavoriteOverlaysAction>(CoreActionTypes.SET_FAVORITE_OVERLAYS)
		.map(({ payload }: SetFavoriteOverlaysAction) => payload.map(overlay => overlay.id))
		.map((overlayIds) => new SetMarkUp({
				classToSet: MarkUpClass.favorites,
				dataToSet: {
					overlaysIds: overlayIds
				}
			}
		));

	@Effect({ dispatch: false })
	actionsLogger$ = this.actions$
		.ofType(CasesActionTypes.ADD_CASE,
			CasesActionTypes.DELETE_CASE,
			CasesActionTypes.LOAD_CASE,
			CasesActionTypes.LOAD_CASES,
			CasesActionTypes.ADD_CASES,
			CasesActionTypes.SAVE_CASE_AS,
			CasesActionTypes.SAVE_CASE_AS_SUCCESS,
			CasesActionTypes.UPDATE_CASE,
			CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS,
			CasesActionTypes.SELECT_CASE
			)
		.do((action) => {
			this.loggerService.info(JSON.stringify(action));
		});

	@Effect()
	loadOverlays$ = this.actions$
		.ofType<SetOverlaysCriteriaAction>(CoreActionTypes.SET_OVERLAYS_CRITERIA)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.map(([{ payload }, { overlaysCriteria }]) => new LoadOverlaysAction(overlaysCriteria));

	/**
	 * @type Effect
	 * @name onGoPrevNext$
	 * @ofType GoNextAction, GoPrevAction
	 * @dependencies cases
	 * @filter There is an active map overlay
	 * @action GoNextDisplayAction?, GoadjacentDisplayAction?
	 */
	@Effect()
	onAdjacentOverlay$: Observable<any> = this.actions$
		.ofType<GoAdjacentOverlay>(CoreActionTypes.GO_ADJACENT_OVERLAY)
		.withLatestFrom(this.store$.select(casesStateSelector), ({ payload }, casesState: ICasesState): { isNext, overlayId } => {
			const activeMap = casesState.selectedCase.state.maps.data.find(map => casesState.selectedCase.state.maps.activeMapId === map.id);
			const overlayId = activeMap.data.overlay && activeMap.data.overlay.id;
			const { isNext } = payload;
			return { isNext, overlayId };
		})
		.filter(({ isNext, overlayId }) => Boolean(overlayId))
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck('filteredOverlays')), ({ isNext, overlayId }, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(overlayId);
			const adjacent = isNext ? 1 : -1;
			return filteredOverlays[index + adjacent];
		})
		.filter(nextOverlayId => Boolean(nextOverlayId))
		.map(nextOverlayId => new DisplayOverlayFromStoreAction({ id: nextOverlayId }));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected loggerService: LoggerService) {
	}
}


