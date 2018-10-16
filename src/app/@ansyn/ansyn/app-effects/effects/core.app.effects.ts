import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import {
	CoreActionTypes,
	coreStateSelector,
	GoAdjacentOverlay,
	GoNextPresetOverlay,
	IOverlay, IOverlayDrop,
	LoggerService,
	selectRemovedOverlays,
	SetOverlaysCriteriaAction,
	SetPresetOverlaysAction,
	SetRemovedOverlayIdsCount
} from '@ansyn/core';
import {
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes, selectDropsWithoutSpecialObjects,
	selectOverlaysMap
} from '@ansyn/overlays';
import { CasesActionTypes } from '@ansyn/menu-items';
import { IMapState, MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { IAppState } from '../app.effects.module';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class CoreAppEffects {

	@Effect()
	clearPresets$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		map(() => new SetPresetOverlaysAction([]))
	);

	@Effect()
	clearPresetsOnClearOverlays$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		filter(({ clearExistingOverlays }) => clearExistingOverlays),
		map(() => new SetPresetOverlaysAction([]))
	);

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.ADD_CASE,
			CasesActionTypes.DELETE_CASE,
			CasesActionTypes.LOAD_CASE,
			CasesActionTypes.LOAD_CASES,
			CasesActionTypes.ADD_CASES,
			CasesActionTypes.SAVE_CASE_AS,
			CasesActionTypes.SAVE_CASE_AS_SUCCESS,
			CasesActionTypes.UPDATE_CASE,
			CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS,
			CasesActionTypes.SELECT_CASE
		),
		tap((action) => {
			this.loggerService.info(JSON.stringify(action));
		}));

	@Effect()
	loadOverlays$ = this.actions$.pipe(
		ofType<SetOverlaysCriteriaAction>(CoreActionTypes.SET_OVERLAYS_CRITERIA),
		filter(action => !(action.options && action.options.noInitialSearch)),
		withLatestFrom(this.store$.select(coreStateSelector)),
		map(([{ payload }, { overlaysCriteria }]) => new LoadOverlaysAction(overlaysCriteria)));

	@Effect()
	onAdjacentOverlay$: Observable<any> = this.actions$.pipe(
		ofType<GoAdjacentOverlay>(CoreActionTypes.GO_ADJACENT_OVERLAY),
		withLatestFrom(this.store$.select(mapStateSelector), ({ payload }, mapState: IMapState): { isNext, overlayId } => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const overlayId = activeMap.data.overlay && activeMap.data.overlay.id;
			const { isNext } = payload;
			return { isNext, overlayId };
		}),
		filter(({ isNext, overlayId }) => Boolean(overlayId)),
		withLatestFrom(this.store$.select(selectDropsWithoutSpecialObjects), ({ isNext, overlayId }, drops: IOverlayDrop[]): IOverlayDrop => {
			const index = drops.findIndex(({ id }) => id === overlayId);
			const adjacent = isNext ? 1 : -1;
			return drops[index + adjacent];
		}),
		filter(Boolean),
		map(({ id }) => new DisplayOverlayFromStoreAction({ id })));

	@Effect()
	onNextPresetOverlay$: Observable<any> = this.actions$.pipe(
		ofType<GoNextPresetOverlay>(CoreActionTypes.GO_NEXT_PRESET_OVERLAY),
		withLatestFrom(this.store$.select(mapStateSelector), (Action, mapState: IMapState): { overlayId: string, mapId: string } => {
			const activeMap = MapFacadeService.activeMap(mapState);
			return { overlayId: activeMap.data.overlay && activeMap.data.overlay.id, mapId: mapState.activeMapId };
		}),
		withLatestFrom(this.store$.select(coreStateSelector), ({ overlayId, mapId }, { presetOverlays }): { overlay: IOverlay, mapId: string } => {
			const length = presetOverlays.length;
			if (length === 0) {
				return;
			}
			const index = presetOverlays.findIndex(overlay => overlay.id === overlayId);
			const nextIndex = index === -1 ? 0 : index >= length - 1 ? 0 : index + 1;
			return { overlay: presetOverlays[nextIndex], mapId };
		}),
		filter(Boolean),
		map(({ overlay, mapId }) => new DisplayOverlayAction({ overlay, mapId }))
	);

	@Effect()
	removedOverlaysCount$ = combineLatest(this.store$.select(selectRemovedOverlays), this.store$.select(selectOverlaysMap)).pipe(
		map(([removedOverlaysIds, overlays]: [string[], Map<string, IOverlay>]) => {
			const removedOverlaysCount = removedOverlaysIds.filter((removedId) => overlays.has(removedId)).length;
			return new SetRemovedOverlayIdsCount(removedOverlaysCount);
		})
	);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected loggerService: LoggerService) {
	}
}


