import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectPresetOverlays } from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../app.effects.module';
import { casesStateSelector, ICasesState } from '../../modules/menu-items/cases/reducers/cases.reducer';
import {
	ClickOutsideMap,
	ContextMenuShowAction,
	MapActionTypes,
	selectActiveMapId,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import {
	CopySnapshotShareLinkAction,
	GoAdjacentOverlay,
	GoNextPresetOverlay,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '../../modules/status-bar/actions/status-bar.actions';
import { selectGeoFilterActive, selectGeoFilterType } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CopyCaseLinkAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { DisplayOverlayAction, DisplayOverlayFromStoreAction } from '../../modules/overlays/actions/overlays.actions';
import { selectDropsWithoutSpecialObjects } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlay, IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { LoggerService } from '../../modules/core/services/logger.service';
import { CaseGeoFilter } from '../../modules/menu-items/cases/models/case.model';

@Injectable()
export class StatusBarAppEffects {

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(
			StatusBarActionsTypes.COPY_SNAPSHOT_SHARE_LINK,
			StatusBarActionsTypes.GO_ADJACENT_OVERLAY,
			StatusBarActionsTypes.SET_IMAGE_OPENING_ORIENTATION
		),
		tap((action) => {
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Status_Bar', action.type);
		}));

	@Effect()
	onAdjacentOverlay$: Observable<any> = this.actions$.pipe(
		ofType<GoAdjacentOverlay>(StatusBarActionsTypes.GO_ADJACENT_OVERLAY),
		withLatestFrom(this.store.select(selectOverlayOfActiveMap)),
		filter(( [isNext, overlay] ) => Boolean(overlay)),
		withLatestFrom(this.store.select(selectDropsWithoutSpecialObjects), ([ isNext, {id: overlayId} ], drops: IOverlayDrop[]): IOverlayDrop => {
			const index = drops.findIndex(({ id }) => id === overlayId);
			const adjacent = isNext ? 1 : -1;
			return drops[index + adjacent];
		}),
		filter(Boolean),
		map(({ id }) => new DisplayOverlayFromStoreAction({ id })));


	@Effect()
	onNextPresetOverlay$: Observable<any> = this.actions$.pipe(
		ofType<GoNextPresetOverlay>(StatusBarActionsTypes.GO_NEXT_PRESET_OVERLAY),
		withLatestFrom(this.store.select(selectOverlayOfActiveMap), this.store.select(selectActiveMapId), (Action, overlay: IOverlay, activeMapId: string): { overlayId: string, mapId: string } => {
			return { overlayId: overlay && overlay.id, mapId: activeMapId };
		}),
		withLatestFrom(this.store.select(selectPresetOverlays), ({ overlayId, mapId }, presetOverlays): { overlay: IOverlay, mapId: string } => {
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
		ofType<CopySnapshotShareLinkAction>(StatusBarActionsTypes.COPY_SNAPSHOT_SHARE_LINK),
		withLatestFrom(this.store.select(casesStateSelector), (action: CopySnapshotShareLinkAction, state: ICasesState) => {
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
		withLatestFrom(this.store.select(selectGeoFilterActive), this.store.select(selectGeoFilterType)),
		filter(([action, active, type]) => active),
		map(([action, active, type]) => {
			const oldValue = type === CaseGeoFilter.PinPoint ? CaseGeoFilter.Polygon : CaseGeoFilter.PinPoint;
			return new UpdateGeoFilterStatus({type: oldValue, active: false});
		})
	);

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				public overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}

}
