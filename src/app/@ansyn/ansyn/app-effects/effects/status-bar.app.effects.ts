import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
	overlayStatusStateSelector,
	selectPresetOverlays
} from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../app.effects.module';
import { casesStateSelector, ICasesState } from '../../modules/menu-items/cases/reducers/cases.reducer';
import {
	ClickOutsideMap,
	ContextMenuShowAction, imageryStatusStateSelector,
	IMapState,
	MapActionTypes,
	MapFacadeService,
	mapStateSelector
} from '@ansyn/map-facade';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import {
	CopySelectedCaseLinkAction, GoAdjacentOverlay, GoNextPresetOverlay,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '../../modules/status-bar/actions/status-bar.actions';
import { SearchModeEnum } from '../../modules/status-bar/models/search-mode.enum';
import { selectGeoFilterSearchMode } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CopyCaseLinkAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { DisplayOverlayAction, DisplayOverlayFromStoreAction } from '../../modules/overlays/actions/overlays.actions';
import { selectDropsWithoutSpecialObjects } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlay, IOverlayDrop } from '../../modules/overlays/models/overlay.model';


@Injectable()
export class StatusBarAppEffects {

	@Effect()
	onAdjacentOverlay$: Observable<any> = this.actions$.pipe(
		ofType<GoAdjacentOverlay>(StatusBarActionsTypes.GO_ADJACENT_OVERLAY),
		withLatestFrom(this.store.select(mapStateSelector), ({ payload }, mapState: IMapState): { isNext, overlayId } => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const overlayId = activeMap.data.overlay && activeMap.data.overlay.id;
			const { isNext } = payload;
			return { isNext, overlayId };
		}),
		filter(({ isNext, overlayId }) => Boolean(overlayId)),
		withLatestFrom(this.store.select(selectDropsWithoutSpecialObjects), ({ isNext, overlayId }, drops: IOverlayDrop[]): IOverlayDrop => {
			const index = drops.findIndex(({ id }) => id === overlayId);
			const adjacent = isNext ? 1 : -1;
			return drops[index + adjacent];
		}),
		filter(Boolean),
		map(({ id }) => new DisplayOverlayFromStoreAction({ id })));


	@Effect()
	onNextPresetOverlay$: Observable<any> = this.actions$.pipe(
		ofType<GoNextPresetOverlay>(StatusBarActionsTypes.GO_NEXT_PRESET_OVERLAY),
		withLatestFrom(this.store.select(mapStateSelector), (Action, mapState: IMapState): { overlayId: string, mapId: string } => {
			const activeMap = MapFacadeService.activeMap(mapState);
			return { overlayId: activeMap.data.overlay && activeMap.data.overlay.id, mapId: mapState.activeMapId };
		}),
		withLatestFrom(this.store.select(selectPresetOverlays), ({ overlayId, mapId },  presetOverlays ): { overlay: IOverlay, mapId: string } => {
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
