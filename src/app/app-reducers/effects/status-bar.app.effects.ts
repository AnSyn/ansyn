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
import { BackToWorldAction } from '@ansyn/map-facade/actions/map.actions';
import {
	GoNextDisplayAction,
	GoPrevDisplayAction,
	LoadOverlaysAction,
	OverlaysMarkupAction
} from '@ansyn/overlays/actions/overlays.actions';
import { SetGeoFilterAction, SetOrientationAction, SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { EnableOnlyFavortiesSelectionAction } from '@ansyn/menu-items/filters/';
import { OverlaysActionTypes, SyncFilteredOverlays } from '@ansyn/overlays/actions';
import { SetOverlayNotInCaseAction, SetOverlaysCountAction } from '@ansyn/status-bar/actions';
import { MapActionTypes } from '@ansyn/map-facade/actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';


@Injectable()
export class StatusBarAppEffects {

	@Effect({ dispatch: false })
	updatePinPointSearchAction$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch)
		.withLatestFrom(this.store.select('status_bar'))
		.filter(([action, statusBarState]: [any, any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(() => {
			this.imageryCommunicator.communicatorsAsArray().forEach(c => {
				c.createMapSingleClickEvent();
			});
		});

	@Effect({ dispatch: false })
	updatePinPointIndicatorAction$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointIndicator)
		.withLatestFrom(this.store.select('status_bar'), this.store.select('cases'))
		.map(([action, statusBarState, casesState]: [UpdateStatusFlagsAction, IStatusBarState, ICasesState]) => {

			const value: boolean = statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator);
			this.imageryCommunicator.communicatorsAsArray().forEach(c => {
				if (value) {
					const point = getPointByPolygon(casesState.selected_case.state.region);
					const latLon = point.coordinates;
					c.addPinPointIndicator(latLon);
				} else {
					c.removePinPointIndicator();
				}

			});
		});

	@Effect()
	onCopySelectedCaseLink$ = this.actions$
		.ofType(StatusBarActionsTypes.COPY_SELECTED_CASE_LINK)
		.withLatestFrom(this.store.select('cases'), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
			return state.selected_case.id;
		})
		.map((case_id: string) => {
			return new CopyCaseLinkAction(case_id);
		});


	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store.select('cases'), (action, state: ICasesState): Case => state.selected_case)
		.filter((selected_case) => !isEmpty(selected_case))
		.cloneDeep()
		.mergeMap((selected_case: Case) => {
			const layouts_index = selected_case.state.maps.layouts_index;
			return [
				new ChangeLayoutAction(+layouts_index),
				new SetOrientationAction(selected_case.state.orientation),
				new SetGeoFilterAction(selected_case.state.geoFilter),
				new SetTimeAction({
					from: new Date(selected_case.state.time.from),
					to: new Date(selected_case.state.time.to)
				})
			];
		});

	@Effect()
	statusBarChanges$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.SET_ORIENTATION, StatusBarActionsTypes.SET_GEO_FILTER, StatusBarActionsTypes.SET_TIME)
		.withLatestFrom(this.store.select('cases'), (action, state: ICasesState): any[] => [action, state.selected_case])
		.filter(([action, selected_case]) => !isEmpty(selected_case))
		.mergeMap(([action, selected_case]: [SetOrientationAction | SetGeoFilterAction | SetTimeAction | any, Case]) => {
			const updatedCase = cloneDeep(selected_case);
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

	@Effect()
	onBackToWorldView$: Observable<BackToWorldAction> = this.actions$
		.ofType(StatusBarActionsTypes.BACK_TO_WORLD_VIEW)
		.map(() => {
			return new BackToWorldAction();
		});

	@Effect()
	onFavorite$: Observable<Action> = this.actions$
		.ofType(StatusBarActionsTypes.FAVORITE)
		.withLatestFrom(this.store.select('cases'), (action: Action, cases: ICasesState): Case => cloneDeep(cases.selected_case))
		.filter((selectedCase: Case) => {
			const activeMap = selectedCase.state.maps.data.find(item => item.id === selectedCase.state.maps.active_map_id);
			return !isEmpty(activeMap.data.overlay);
		})

		.mergeMap((selectedCase: Case) => {
			const actions = [];
			const activeMap = selectedCase.state.maps.data.find(item => item.id === selectedCase.state.maps.active_map_id);

			//lagecy support
			if (!selectedCase.state.favoritesOverlays) {
				selectedCase.state.favoritesOverlays = [];
			}

			if (selectedCase.state.favoritesOverlays.indexOf(activeMap.data.overlay.id) > -1) {
				pull(selectedCase.state.favoritesOverlays, activeMap.data.overlay.id);
				if (selectedCase.state.facets.showOnlyFavorites) {
					actions.push(new SyncFilteredOverlays());
				}
			} else {
				selectedCase.state.favoritesOverlays.push(activeMap.data.overlay.id);
			}

			const overlaysMarkup = CasesService.getOverlaysMarkup(selectedCase);

			//order does metter update case must be the first actions since all other relays on him
			actions.unshift(new UpdateCaseAction(selectedCase));
			actions.push(new OverlaysMarkupAction(overlaysMarkup));
			actions.push(new EnableOnlyFavortiesSelectionAction(!!selectedCase.state.favoritesOverlays.length));

			return actions;
		});

	@Effect({ dispatch: false })
	onExpand$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.EXPAND)
		.map(() => {
			console.log('onExpand$');
		});


	@Effect()
	onGoPrevNext$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.GO_NEXT, StatusBarActionsTypes.GO_PREV)
		.withLatestFrom(this.store.select('cases'), (action, casesState: ICasesState) => {
			const activeMap = casesState.selected_case.state.maps.data.find(map => casesState.selected_case.state.maps.active_map_id === map.id);
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

	@Effect()
	setOverlayCount$ = this.actions$
		.ofType(OverlaysActionTypes.UPDATE_OVERLAYS_COUNT)
		.map(({ payload }) => {
			return new SetOverlaysCountAction(payload);
		});

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

	constructor(private actions$: Actions,
				private store: Store<IAppState>,
				public imageryCommunicator: ImageryCommunicatorService,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
