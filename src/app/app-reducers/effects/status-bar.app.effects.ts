import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	ChangeLayoutAction,
	CopySelectedCaseLinkAction,
	IStatusBarState,
	StatusBarActionsTypes,
	statusBarFlagsItems,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import {
	Case,
	CaseMapState,
	CasesActionTypes,
	CopyCaseLinkAction,
	ICasesState,
	UpdateCaseAction
} from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import { cloneDeep, get, isEmpty, pull } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { BackToWorldAction, PinPointModeTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import {
	GoNextDisplayAction,
	GoPrevDisplayAction,
	LoadOverlaysAction,
	OverlaysMarkupAction
} from '@ansyn/overlays/actions/overlays.actions';
import { SetGeoFilterAction, SetOrientationAction, SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/';
import { OverlaysActionTypes, SyncFilteredOverlays } from '@ansyn/overlays/actions';
import { SetOverlayNotInCaseAction, SetOverlaysCountAction } from '@ansyn/status-bar/actions';
import { MapActionTypes } from '@ansyn/map-facade/actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';


@Injectable()
export class StatusBarAppEffects {

	/**
	 * @type Effect
	 * @name updatePinPointSearchAction$
	 * @ofType UpdateStatusFlagsAction
	 * @dependencies status_bar
	 * @filter update pinPointSearch and in pinPointSearch
	 */
	@Effect({ dispatch: false })
	updatePinPointSearchAction$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select('status_bar'))
		.filter(([action, statusBarState]: [any, any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(() => {
			this.imageryCommunicator.communicatorsAsArray().forEach(communicator => {
				communicator.createMapSingleClickEvent();
			});
		});

	/**
	 * @type Effect
	 * @name updatePinPointIndicatorAction$
	 * @ofType UpdateStatusFlagsAction
	 * @dependencies status_bar, cases
	 * @filter update pinPointIndicator
	 */
	@Effect({ dispatch: false })
	updatePinPointIndicatorAction$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointIndicator)
		.withLatestFrom(this.store.select('status_bar'), this.store.select('cases'))
		.map(([action, statusBarState, casesState]: [UpdateStatusFlagsAction, IStatusBarState, ICasesState]) => {

			const value: boolean = statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator);
			this.imageryCommunicator.communicatorsAsArray().forEach(communicator => {
				if (value) {
					const point = getPointByPolygon(casesState.selectedCase.state.region);
					const latLon = point.coordinates;
					communicator.addPinPointIndicator(latLon);
				} else {
					communicator.removePinPointIndicator();
				}

			});
		});

	/**
	 * @type Effect
	 * @name onCopySelectedCaseLink$
	 * @ofType CopySelectedCaseLinkAction
	 * @dependencies cases
	 * @action CopyCaseLinkAction
	 */
	@Effect()
	onCopySelectedCaseLink$ = this.actions$
		.ofType(StatusBarActionsTypes.COPY_SELECTED_CASE_LINK)
		.withLatestFrom(this.store.select('cases'), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
			return state.selectedCase.id;
		})
		.map((case_id: string) => {
			return new CopyCaseLinkAction(case_id);
		});

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @filter Case is truthy
	 * @action ChangeLayoutAction, SetOrientationAction, SetGeoFilterAction, SetTimeAction
	 */
	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => Boolean(payload))
		.mergeMap(({ payload }: SelectCaseAction) => {
			const layoutsIndex = payload.state.maps.layouts_index;
			return [
				new ChangeLayoutAction(+layoutsIndex),
				new SetOrientationAction(payload.state.orientation),
				new SetGeoFilterAction(payload.state.geoFilter),
				new SetTimeAction({
					from: new Date(payload.state.time.from),
					to: new Date(payload.state.time.to)
				})
			];
		});

	/**
	 * @type Effect
	 * @name statusBarChanges$
	 * @ofType SetOrientationAction, SetGeoFilterAction, SetTimeAction
	 * @dependencies cases
	 * @filter There is a selected case
	 * @action UpdateCaseAction, LoadOverlaysAction?
	 */
	@Effect()
	statusBarChanges$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.SET_ORIENTATION, StatusBarActionsTypes.SET_GEO_FILTER, StatusBarActionsTypes.SET_TIME)
		.withLatestFrom(this.store.select('cases'), (action, state: ICasesState): any[] => [action, state.selectedCase])
		.filter(([action, selectedCase]) => !isEmpty(selectedCase))
		.mergeMap(([action, selectedCase]: [SetOrientationAction | SetGeoFilterAction | SetTimeAction | any, Case]) => {
			const updatedCase = cloneDeep(selectedCase);
			const actions: Action[] = [new UpdateCaseAction(updatedCase)];

			switch (action.constructor) {
				case SetOrientationAction:
					updatedCase.state.orientation = action.payload;
					break;
				case SetGeoFilterAction:
					updatedCase.state.geoFilter = action.payload;
					break;
				case SetTimeAction:
					const fromChange = updatedCase.state.time.from !== action.payload.from.toISOString();
					const toChange = updatedCase.state.time.to !== action.payload.to.toISOString();
					const someTimeChanges = fromChange || toChange;
					if (someTimeChanges) {
						updatedCase.state.time.from = action.payload.from.toISOString();
						updatedCase.state.time.to = action.payload.to.toISOString();
						actions.push(new LoadOverlaysAction({
							to: updatedCase.state.time.to,
							from: updatedCase.state.time.from,
							polygon: updatedCase.state.region,
							caseId: updatedCase.id
						}));
					}
					break;
			}
			return actions;
		});

	/**
	 * @type Effect
	 * @name onBackToWorldView$
	 * @ofType BackToWorldViewAction
	 * @action BackToWorldAction
	 */
	@Effect()
	onBackToWorldView$: Observable<BackToWorldAction> = this.actions$
		.ofType(StatusBarActionsTypes.BACK_TO_WORLD_VIEW)
		.map(() => new BackToWorldAction());

	/**
	 * @type Effect
	 * @name onFavorite$
	 * @ofType FavoriteAction
	 * @dependencies cases
	 * @filter There is an active map overlay
	 * @action UpdateCaseAction?, SyncFilteredOverlays, OverlaysMarkupAction, EnableOnlyFavoritesSelectionAction
	 */
	@Effect()
	onFavorite$: Observable<Action> = this.actions$
		.ofType(StatusBarActionsTypes.FAVORITE)
		.withLatestFrom(this.store.select('cases'), (action: Action, cases: ICasesState): Case => cloneDeep(cases.selectedCase))
		.filter((selectedCase: Case) => {
			const activeMap = selectedCase.state.maps.data.find(item => item.id === selectedCase.state.maps.active_map_id);
			return !isEmpty(activeMap.data.overlay);
		})
		.mergeMap((selectedCase: Case) => {
			const actions = [];
			const activeMap = selectedCase.state.maps.data.find(item => item.id === selectedCase.state.maps.active_map_id);

			// lagecy support
			if (!selectedCase.state.favoritesOverlays) {
				selectedCase.state.favoritesOverlays = [];
			}

			if (selectedCase.state.favoritesOverlays.includes(activeMap.data.overlay.id)) {
				pull(selectedCase.state.favoritesOverlays, activeMap.data.overlay.id);
				if (selectedCase.state.facets.showOnlyFavorites) {
					actions.push(new SyncFilteredOverlays());
				}
			} else {
				selectedCase.state.favoritesOverlays.push(activeMap.data.overlay.id);
			}

			const overlaysMarkup = CasesService.getOverlaysMarkup(selectedCase);

			// order does matter! update case must be the first action, since all other relies on it
			actions.unshift(new UpdateCaseAction(selectedCase));
			actions.push(new OverlaysMarkupAction(overlaysMarkup));
			actions.push(new EnableOnlyFavoritesSelectionAction(Boolean(selectedCase.state.favoritesOverlays.length)));

			return actions;
		});

	/**
	 * @type Effect
	 * @name onExpand$
	 * @ofType ExpandAction
	 */
	@Effect({ dispatch: false })
	onExpand$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.EXPAND)
		.map(() => {
			console.log('onExpand$');
		});

	/**
	 * @type Effect
	 * @name onGoPrevNext$
	 * @ofType GoNextAction, GoPrevAction
	 * @dependencies cases
	 * @filter There is an active map overlay
	 * @action GoNextDisplayAction?, GoPrevDisplayAction?
	 */
	@Effect()
	onGoPrevNext$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.GO_NEXT, StatusBarActionsTypes.GO_PREV)
		.withLatestFrom(this.store.select('cases'), (action, casesState: ICasesState) => {
			const activeMap = casesState.selectedCase.state.maps.data.find(map => casesState.selectedCase.state.maps.active_map_id === map.id);
			const overlayId = get(activeMap.data.overlay, 'id');
			return [action.type, overlayId];
		})
		.filter(([actionType, overlayId]) => {
			return !isEmpty(overlayId);
		})
		.map(([actionType, currentOverlayId]: [string, string]) => {
			switch (actionType) {
				case StatusBarActionsTypes.GO_NEXT:
					return new GoNextDisplayAction(currentOverlayId);
				case StatusBarActionsTypes.GO_PREV:
					return new GoPrevDisplayAction(currentOverlayId);
			}
		});

	/**
	 * @type Effect
	 * @name setOverlayCount$
	 * @ofType UpdateOverlaysCountAction
	 * @action SetOverlaysCountAction
	 */
	@Effect()
	setOverlayCount$ = this.actions$
		.ofType(OverlaysActionTypes.UPDATE_OVERLAYS_COUNT)
		.map(({ payload }) => new SetOverlaysCountAction(payload));

	/**
	 * @type Effect
	 * @name setOverlaysNotFromCase$
	 * @ofType SetOverlayNotInCaseAction
	 * @dependencies map
	 * @action SetOverlayNotInCaseAction
	 */
	@Effect()
	setOverlaysNotFromCase$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_OVERLAYS_NOT_IN_CASE)
		.withLatestFrom(this.store.select('map'), ({ payload }, mapState: IMapState) => [payload, MapFacadeService.activeMap(mapState)])
		.map(([overlaysNotInCase, activeMap]: [Map<string, boolean>, CaseMapState]) => {
			if (activeMap.data.overlay) {
				const { id } = activeMap.data.overlay;
				return overlaysNotInCase.has(id) ? overlaysNotInCase.get(id) : false;
			} else {
				return false;
			}
		})
		.map((notInCaseResult: boolean) => new SetOverlayNotInCaseAction(notInCaseResult));

	/**
	 * @type Effect
	 * @name updatePinPointModeAction$
	 * @ofType UpdateStatusFlagsAction
	 * @dependencies status_bar
	 * @filter is action pinPointSearch
	 * @action PinPointModeTriggerAction
	 */
	@Effect()
	updatePinPointModeAction$: Observable<PinPointModeTriggerAction> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select('status_bar').pluck('flags'))
		.map(([action, flags]: [any, Map<any, any>]) => flags.get(statusBarFlagsItems.pinPointSearch))
		.map((value: boolean) => new PinPointModeTriggerAction(value));

	constructor(private actions$: Actions,
				private store: Store<IAppState>,
				public imageryCommunicator: ImageryCommunicatorService,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
