import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import {
	CoreActionTypes,
	GoAdjacentOverlay,
	GoNextPresetOverlay,
	SetOverlaysCriteriaAction,
	SetPresetOverlaysAction
} from '@ansyn/core/actions/core.actions';
import {
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes
} from '@ansyn/overlays/actions/overlays.actions';
import { coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IOverlay } from '@ansyn/core/models/overlay.model';

@Injectable()
export class CoreAppEffects {
	/**
	 * @type Effect
	 * @name clearPresets$
	 * @ofType LoadOverlaysAction
	 * @dependencies core
	 * @action SetPresetOverlaysAction
	 */
	@Effect()
	clearPresets$: Observable<any> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new SetPresetOverlaysAction([]));

	@Effect()
	clearPresetsOnClearOverlays$: Observable<any> = this.actions$
		.ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.filter(({ clearExistingOverlays }) => clearExistingOverlays)
		.map(() => new SetPresetOverlaysAction([]));

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
		.filter(action => !(action.options && action.options.noInitialSearch))
		.withLatestFrom(this.store$.select(coreStateSelector))
		.map(([{ payload }, { overlaysCriteria }]) => new LoadOverlaysAction(overlaysCriteria));

	/**
	 * @type Effect
	 * @name onAdjacentOverlay$
	 * @ofType GoAdjacentOverlay
	 * @dependencies cases
	 * @filter There is an active map overlay
	 * @action DisplayOverlayFromStoreAction
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

	/**
	 * @type Effect
	 * @name onNextPresetOverlay$
	 * @ofType GoAdjacentOverlay
	 * @dependencies cases
	 * @filter There is an active map overlay
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	onNextPresetOverlay$: Observable<any> = this.actions$
		.ofType<GoNextPresetOverlay>(CoreActionTypes.GO_NEXT_PRESET_OVERLAY)
		.withLatestFrom(this.store$.select(mapStateSelector), (Action, mapState: IMapState): { overlayId: string, mapId: string } => {
			const activeMap = MapFacadeService.activeMap(mapState);
			return { overlayId: activeMap.data.overlay && activeMap.data.overlay.id, mapId: mapState.activeMapId };
		})
		.withLatestFrom(this.store$.select(coreStateSelector), ({ overlayId, mapId }, { presetOverlays }): { overlay: IOverlay, mapId: string } => {
			const length = presetOverlays.length;
			if (length === 0) {
				return;
			}
			const index = presetOverlays.findIndex(overlay => overlay.id === overlayId);
			const nextIndex = index === -1 ? 0 : index >= length - 1 ? 0 : index + 1;
			return { overlay: presetOverlays[nextIndex], mapId };
		})
		.filter(Boolean)
		.map(({ overlay, mapId }) => new DisplayOverlayAction({ overlay, mapId }));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected loggerService: LoggerService) {
	}
}


