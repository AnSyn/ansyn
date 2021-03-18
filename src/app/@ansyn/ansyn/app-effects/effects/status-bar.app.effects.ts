import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { casesStateSelector, ICasesState } from '../../modules/menu-items/cases/reducers/cases.reducer';
import {
	MapActionTypes, selectFourViewsMode,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import {
	CopySnapshotShareLinkAction,
	GoAdjacentOverlay, SearchAction,
	StatusBarActionsTypes,
	UpdateGeoFilterStatus
} from '../../modules/status-bar/actions/status-bar.actions';
import { selectGeoFilterActive, selectGeoFilterType } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CopyCaseLinkAction } from '../../modules/menu-items/cases/actions/cases.actions';
import {
	DisplayOverlayFromStoreAction,
	SetOverlaysCriteriaAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	selectDropsAscending,
	selectFourViewsOverlays,
	selectRegion
} from '../../modules/overlays/reducers/overlays.reducer';
import { IFourViews, IOverlay, IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { MenuActionTypes, SelectMenuItemAction } from '@ansyn/menu';
import { ToolsActionsTypes } from '../../modules/status-bar/components/tools/actions/tools.actions';
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
		withLatestFrom(this.store.select(selectOverlayOfActiveMap), this.store.select(selectFourViewsMode)),
		filter(([action, overlay, fourViewsMode]) => Boolean(overlay) && !fourViewsMode),
		withLatestFrom(this.store.select(selectDropsAscending), ([{ payload }, { id: overlayId }, fourViewsMode], drops: IOverlayDrop[]): IOverlayDrop => this.getAdjacentOverlay(drops, overlayId, payload.isNext)),
		filter(Boolean),
		map(({ id }) => new DisplayOverlayFromStoreAction({ id })));

	@Effect()
	onAdjacentOverlayFourViews$: Observable<any> = this.actions$.pipe(
		ofType<GoAdjacentOverlay>(StatusBarActionsTypes.GO_ADJACENT_OVERLAY),
		withLatestFrom(this.store.select(selectOverlayOfActiveMap), this.store.select(selectFourViewsMode)),
		filter(([action, overlay, fourViewsMode]) => Boolean(overlay) && fourViewsMode),
		withLatestFrom(this.store.select(selectFourViewsOverlays), ([{ payload }, { id: overlayId }, fourViewsMode], fourViewsOverlays: IFourViews): IOverlayDrop => {
			const currentMapAngleOverlays = this.findAngleOverlaysByOverlay(fourViewsOverlays, overlayId);
			return this.getAdjacentOverlay(currentMapAngleOverlays, overlayId, payload.isNext);
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

	@Effect()
	onAdvancedSearchClick$ = this.actions$.pipe(
		ofType<SearchAction>(StatusBarActionsTypes.SEARCH_ACTION),
		withLatestFrom(this.store.pipe(select(selectGeoFilterType))),
		map(([action, geoFilter]) => {
			const options: any = { runSecondSearch: false };
			if (geoFilter === CaseGeoFilter.ScreenView) {
				options.noInitialSearch = true;
			}
			return new SetOverlaysCriteriaAction({ ...action.payload }, options);
		})
	);

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>) {
	}

	getAdjacentOverlay(overlays, overlayId: string, isNext: boolean) {
		if (Boolean(overlays.length)) {
			const adjacent = isNext ? 1 : -1;
			const index = overlays.findIndex(({ id }) => id === overlayId);
			if (index >= 0) {
				return overlays[index + adjacent];
			}

			return adjacent > 0 ? overlays[overlays.length - 1] : overlays[0];
		}
	}

	findAngleOverlaysByOverlay(fourViewsOverlays: IFourViews, overlayId: string): IOverlay[] {
		const fourViewsOverlaysKeys = Object.keys(fourViewsOverlays);
		if (!fourViewsOverlaysKeys.length) {
			return;
		}


		const angleKey = fourViewsOverlaysKeys.find(key => fourViewsOverlays[key].map((({ id }) => id)).includes(overlayId));
		return fourViewsOverlays[angleKey];
	}

}
