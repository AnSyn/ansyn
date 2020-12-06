import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { casesStateSelector, ICasesState } from '../../modules/menu-items/cases/reducers/cases.reducer';
import {
	ClickOutsideMap,
	ContextMenuShowAction,
	MapActionTypes,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import {
	CopySnapshotShareLinkAction,
	GoAdjacentOverlay,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '../../modules/status-bar/actions/status-bar.actions';
import { selectGeoFilterActive, selectGeoFilterType } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CopyCaseLinkAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { DisplayOverlayFromStoreAction } from '../../modules/overlays/actions/overlays.actions';
import { selectDropsAscending, selectRegion } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { MenuActionTypes, SelectMenuItemAction } from '@ansyn/menu';
import { ToolsActionsTypes } from '../../modules/menu-items/tools/actions/tools.actions';
import { CaseGeoFilter } from '../../modules/menu-items/cases/models/case.model';

@Injectable()
export class StatusBarAppEffects {

	isPolygonSearch$ = this.store.pipe(
		select(selectGeoFilterType),
		map((geoFilterSearchMode: CaseGeoFilter) => geoFilterSearchMode === CaseGeoFilter.Polygon)
	);

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
	onCancelGeoFilter$ = this.actions$.pipe(
		ofType<UpdateGeoFilterStatus>(StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS),
		filter(action => action.payload === undefined),
		withLatestFrom(this.store.select(selectRegion)),
		map(([action, region]) => {
			const type = region.properties.searchMode;
			return new UpdateGeoFilterStatus({ type, active: false })
		})
	);

	@Effect()
	geoFilterSearchInterrupted$: Observable<any> = this.actions$.pipe(
		ofType(
			MenuActionTypes.SELECT_MENU_ITEM,
			MapActionTypes.SET_LAYOUT,
			ToolsActionsTypes.SET_SUB_MENU,
			MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP,
			MapActionTypes.CONTEXT_MENU.SHOW),
		withLatestFrom(this.store.select(selectGeoFilterActive)),
		filter(([action, isGeoFilterActive]: [SelectMenuItemAction, boolean]) => isGeoFilterActive),
		map(() => new UpdateGeoFilterStatus())
	);

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>) {
	}

}
