import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import '@ansyn/core/utils/debug';
import '@ansyn/core/utils/clone-deep';
import {
	CoreActionTypes, GoAdjacentOverlay, SetFavoriteOverlaysAction, SetOverlaysCriteriaAction,
	ToggleFavoriteAction
} from '@ansyn/core/actions/core.actions';
import { DisplayOverlayFromStoreAction, LoadOverlaysAction, SetMarkUp } from '@ansyn/overlays/actions/overlays.actions';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { MarkUpClass, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';

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
		.withLatestFrom(this.store$.select(mapStateSelector), ({ payload }, mapState: IMapState): { isNext, overlayId } => {
			const activeMap = MapFacadeService.activeMap(mapState);
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
		.filter(Boolean)
		.map(id => new DisplayOverlayFromStoreAction({ id }));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected loggerService: LoggerService) {
	}
}


