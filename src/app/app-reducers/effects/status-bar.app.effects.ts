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
import { cloneDeep, get, isEmpty } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { BackToWorldAction, PinPointModeTriggerAction, SetFavoriteAction } from '@ansyn/map-facade/actions/map.actions';
import { GoNextDisplayAction, GoPrevDisplayAction, LoadOverlaysAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetGeoFilterAction, SetOrientationAction, SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/';
import { OverlaysActionTypes } from '@ansyn/overlays/actions';
import { SetOverlayNotInCaseAction, SetOverlaysCountAction } from '@ansyn/status-bar/actions';
import { MapActionTypes } from '@ansyn/map-facade/actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetFavoriteAction } from '@ansyn/map-facade/actions/map.actions';
import { statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { SetOverlaysNotInCaseAction } from '@ansyn/map-facade/actions/map.actions';
import { UpdateOverlaysCountAction } from '@ansyn/overlays/actions/overlays.actions';
import { FavoriteAction } from '@ansyn/status-bar/actions/status-bar.actions';


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
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select(statusBarStateSelector))
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
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointIndicator)
		.withLatestFrom(this.store.select(statusBarStateSelector), this.store.select(casesStateSelector))
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
		.withLatestFrom(this.store.select(casesStateSelector), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
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
		.withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState): any[] => [action, state.selectedCase])
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
	 * @action SetFavoriteAction
	 */
	@Effect()
	onFavorite$: Observable<Action> = this.actions$
		.ofType<FavoriteAction>(StatusBarActionsTypes.FAVORITE)
		.map((action) => new SetFavoriteAction(action.payload));

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
		.withLatestFrom(this.store.select(casesStateSelector), (action, casesState: ICasesState) => {
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
		.ofType<UpdateOverlaysCountAction>(OverlaysActionTypes.UPDATE_OVERLAYS_COUNT)
		.map(({ payload }) => new SetOverlaysCountAction(payload));

	/**
	 * @type Effect
	 * @name setOverlaysNotFromCase$
	 * @ofType SetOverlaysNotInCaseAction
	 * @dependencies map
	 * @action SetOverlayNotInCaseAction
	 */
	@Effect()
	setOverlaysNotFromCase$: Observable<any> = this.actions$
		.ofType<SetOverlaysNotInCaseAction>(MapActionTypes.SET_OVERLAYS_NOT_IN_CASE)
		.withLatestFrom(this.store.select(mapStateSelector), ({ payload }, mapState: IMapState) => [payload, MapFacadeService.activeMap(mapState)])
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
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select(statusBarStateSelector).pluck('flags'))
		.map(([action, flags]: [any, Map<any, any>]) => flags.get(statusBarFlagsItems.pinPointSearch))
		.map((value: boolean) => new PinPointModeTriggerAction(value));

	constructor(private actions$: Actions,
				private store: Store<IAppState>,
				public imageryCommunicator: ImageryCommunicatorService,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
