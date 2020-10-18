import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { casesStateSelector, ICasesState } from '../../modules/menu-items/cases/reducers/cases.reducer';
import {
	ClickOutsideMap,
	ContextMenuShowAction,
	MapActionTypes,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import {
	CopySnapshotShareLinkAction,
	GoAdjacentOverlay,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '../../modules/status-bar/actions/status-bar.actions';
import { selectGeoFilterActive, selectGeoFilterStatus } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CopyCaseLinkAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { DisplayOverlayFromStoreAction } from '../../modules/overlays/actions/overlays.actions';
import { selectDropsAscending } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { LoggerService } from '../../modules/core/services/logger.service';

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
		filter(([action, overlay]) => Boolean(overlay)),
		withLatestFrom(this.store.select(selectDropsAscending), ([action, { id: overlayId }], drops: IOverlayDrop[]): IOverlayDrop => {
			if (Boolean(drops.length)) {
				const isNextOverlay = action.payload.isNext;
				const adjacent = isNextOverlay ? 1 : -1;
				const index = drops.findIndex(({ id }) => id === overlayId);
				if (index >= 0) {
					return drops[index + adjacent];
				}

				return adjacent > 0 ? drops[drops.length - 1] : drops[0];
			}
		}),
		filter(Boolean),
		map(({ id }) => new DisplayOverlayFromStoreAction({ id })));

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
		withLatestFrom(this.store.select(selectGeoFilterActive)),
		filter(([action, active]) => active),
		map(([action, active]) => new UpdateGeoFilterStatus())
	);

	@Effect()
	onCancelGeoFilter$ = this.actions$.pipe(
		ofType<UpdateGeoFilterStatus>(StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS),
		filter(action => action.payload === undefined),
		withLatestFrom(this.store.select(selectGeoFilterStatus)),
		map(([action, { type }]) => new UpdateGeoFilterStatus({ type, active: false }))
	);

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				protected loggerService: LoggerService) {
	}

}
