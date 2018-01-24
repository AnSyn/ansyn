import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	OverlaysMarkupAction,
	SetTimelineStateAction
} from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { CasesService } from '@ansyn/menu-items/cases';
import { LoadOverlaysAction, Overlay } from '@ansyn/overlays';
import { isEmpty, last } from 'lodash';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { IOverlaysState, overlaysStateSelector, TimelineState } from '@ansyn/overlays/reducers/overlays.reducer';
import {
	ChangeLayoutAction, IStatusBarState, layoutOptions, SetTimeAction,
	statusBarStateSelector
} from '@ansyn/status-bar';
import {
	IMapState,
	MapActionTypes,
	mapStateSelector,
	RemovePendingOverlayAction,
	SetPendingOverlaysAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade';
import { CaseMapState, MapsLayout } from '@ansyn/core';
import { CoreService } from '@ansyn/core/services/core.service';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';

@Injectable()
export class OverlaysAppEffects {

	/**
	 * @type Effect
	 * @name onOverlaysMarkupsChanged$
	 * @ofType LoadOverlaysSuccessAction
	 * @dependencies cases
	 * @filter There is a selected case
	 * @action OverlaysMarkupAction
	 */
	@Effect()
	onOverlaysMarkupsChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(coreStateSelector))
		.map(([action, map, core]: [Action, IMapState, ICoreState]) => {
			const overlaysMarkup = CoreService.getOverlaysMarkup(map.mapsList, map.activeMapId, core.favoriteOverlays);
			return new OverlaysMarkupAction(overlaysMarkup);
		});

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @filter There isn't an imagery count and the case is not empty
	 * @action LoadOverlaysAction
	 */
	@Effect()
	selectCase$: Observable<LoadOverlaysAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter((action: SelectCaseAction) => this.casesService.contextValues.imageryCountBefore === -1 &&
			this.casesService.contextValues.imageryCountAfter === -1)
		.filter((action: SelectCaseAction) => !isEmpty(action.payload))
		.map(({ payload }: SelectCaseAction) => {
			const overlayFilter: any = {
				to: payload.state.time.to,
				from: payload.state.time.from,
				polygon: payload.state.region,
				caseId: payload.id
			};
			return new LoadOverlaysAction(overlayFilter);
		});

	/**
	 * @type Effect
	 * @name selectCaseWithImageryCountBefore$
	 * @ofType SelectCaseAction
	 * @filter There is an imagery count before and the case is not empty
	 * @action UpdateCaseAction, SetTimeAction, LoadOverlaysAction
	 */
	@Effect()
	selectCaseWithImageryCountBefore$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(() => this.casesService.contextValues.imageryCountBefore !== -1 && this.casesService.contextValues.imageryCountAfter === -1)
		.filter(({ payload }: SelectCaseAction) => !isEmpty(payload))
		.switchMap(({ payload }: SelectCaseAction) => {
			return this.overlaysService.getStartDateViaLimitFacets({
				region: payload.state.region,
				limit: this.casesService.contextValues.imageryCountBefore,
				facets: payload.state.facets
			})
				.mergeMap((data: { startDate, endDate }) => {
					const from = new Date(data.startDate);
					const to = new Date(data.endDate);
					payload.state.time.from = from.toISOString();
					payload.state.time.to = to.toISOString();

					const overlayFilter: any = {
						to: payload.state.time.to,
						from: payload.state.time.from,
						polygon: payload.state.region,
						caseId: payload.id
					};

					return [
						new UpdateCaseAction(payload),
						new SetTimeAction({ from, to }),
						new LoadOverlaysAction(overlayFilter)
					];
				});
		});

	/**
	 * @type Effect
	 * @name selectCaseWithImageryCountBeforeAndAfter$
	 * @ofType SelectCaseAction
	 * @filter There is an imagery count before and after and the case is not empty
	 * @action UpdateCaseAction, SetTimeAction, LoadOverlaysAction
	 */
	@Effect()
	selectCaseWithImageryCountBeforeAndAfter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(() => {
			return this.casesService.contextValues.imageryCountBefore !== -1 && this.casesService.contextValues.imageryCountAfter !== -1;
		})
		.filter(({ payload }: SelectCaseAction) => !isEmpty(payload))
		.switchMap(({ payload }: SelectCaseAction) => {
			return this.overlaysService.getStartAndEndDateViaRangeFacets({
				region: payload.state.region,
				limitBefore: this.casesService.contextValues.imageryCountBefore,
				limitAfter: this.casesService.contextValues.imageryCountAfter,
				facets: payload.state.facets,
				date: this.casesService.contextValues.time
			})
				.mergeMap((data: { startDate, endDate }) => {
					const from = new Date(data.startDate);
					const to = new Date(data.endDate);
					payload.state.time.from = from.toISOString();
					payload.state.time.to = to.toISOString();

					const overlayFilter: any = {
						to: payload.state.time.to,
						from: payload.state.time.from,
						polygon: payload.state.region,
						caseId: payload.id
					};

					return [
						new UpdateCaseAction(payload),
						new SetTimeAction({ from, to }),
						new LoadOverlaysAction(overlayFilter)
					];
				});
		});

	/**
	 * @type Effect
	 * @name initTimelineState$
	 * @ofType LoadOverlaysSuccessAction
	 * @filter There is an imagery count before or after
	 * @dependencies overlays
	 * @action SetTimelineStateAction
	 */
	@Effect()
	initTimelineState$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.filter(() => this.casesService.contextValues.imageryCountBefore !== -1 || this.casesService.contextValues.imageryCountAfter !== -1)
		.do(() => {
			this.casesService.contextValues.imageryCountBefore = -1;
			this.casesService.contextValues.imageryCountAfter = -1;
		})
		.withLatestFrom(this.store$.select(overlaysStateSelector).pluck<IOverlaysState, TimelineState>('timelineState'), (action, timelineState: TimelineState) => timelineState)
		.map(({ from, to }: TimelineState) => {
			const tenth = (to.getTime() - from.getTime()) / 10;
			const fromTenth = new Date(from.getTime() - tenth);
			const toTenth = new Date(to.getTime() + tenth);
			return new SetTimelineStateAction({ state: { from: fromTenth, to: toTenth } });
		});

	/**
	 * @type Effect
	 * @name displayLatestOverlay$
	 * @ofType SetFilteredOverlaysAction
	 * @dependencies overlays
	 * @filter defaultOverlay is latest and displayedOverlays is not empty
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'latest')
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => {
			return overlays.filteredOverlays;
		})
		.filter((displayedOverlays) => !isEmpty(displayedOverlays))
		.map((displayedOverlays: any[]) => {
			const lastOverlayId = last(displayedOverlays);
			this.casesService.contextValues.defaultOverlay = '';
			return new DisplayOverlayFromStoreAction({ id: lastOverlayId });
		})
		.share();

	/**
	 * @type Effect
	 * @name displayOverlaySetTimeline$
	 * @description this method moves the timeline to active displayed overlay if exists in timeline
	 * @ofType DisplayOverlayAction
	 * @dependencies overlays, map
	 * @filter isActiveMap && displayedOverlay && displayedOverlay is exeeding timelineState
	 * @action SetTimelineStateAction
	 */
	@Effect()
	displayOverlaySetTimeline$ = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector), (action: DisplayOverlayAction, overlays: IOverlaysState, map: IMapState) => {
			const displayedOverlay = action.payload.overlay;
			const timelineState = overlays.timelineState;
			const isActiveMap = !action.payload.mapId || map.activeMapId === action.payload.mapId;
			return [isActiveMap, displayedOverlay, timelineState];
		})
		.filter(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, TimelineState]) => {
			return isActiveMap && displayedOverlay && (displayedOverlay.date < timelineState.from || timelineState.to < displayedOverlay.date);
		})
		.map(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, TimelineState]) => {
			const state = this.overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			return new SetTimelineStateAction({ state });
		});

	/**
	 * @type Effect
	 * @name displayTwoNearestOverlay$
	 * @ofType SetFilteredOverlaysAction
	 * @dependencies overlays
	 * @filter defaultOverlay is nearst
	 * @action DisplayMultipleOverlaysFromStoreAction
	 */
	@Effect()
	displayTwoNearestOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'nearest')
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => {
			return [overlays.filteredOverlays, overlays.overlays];
		})
		.filter(([filteredOverlays, overlays]: [string[], Map<string, Overlay>]) => !isEmpty(filteredOverlays))
		.map(([filteredOverlays, overlays]: [string[], Map<string, Overlay>]) => {

			const overlaysBefore = [...filteredOverlays].reverse().find(overlay => overlays.get(overlay).photoTime < this.casesService.contextValues.time);

			const overlaysAfter = filteredOverlays.find(overlay => overlays.get(overlay).photoTime > this.casesService.contextValues.time);

			return new DisplayMultipleOverlaysFromStoreAction([overlaysBefore, overlaysAfter].filter(overlay => overlay));
		})
		.share();

	/**
	 * @type Effect
	 * @name displayMultipleOverlays$
	 * @ofType DisplayMultipleOverlaysFromStoreAction
	 * @dependencies map
	 * @filter there is at least one none empty overlay to display
	 * @action DisplayOverlayFromStoreAction, SetPendingOverlaysAction, ChangeLayoutAction
	 */
	@Effect()
	displayMultipleOverlays$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE)
		.filter((action: DisplayMultipleOverlaysFromStoreAction) => action.payload.length > 0)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.mergeMap(([action, { mapsList }]: [DisplayMultipleOverlaysFromStoreAction, IMapState]) => {
			const validOverlays = action.payload.filter((overlay) => overlay);

			if (validOverlays.length <= mapsList.length) {
				const actionsArray = [];

				for (let index = 0; index < validOverlays.length; index++) {
					let overlay = validOverlays[index];
					let mapId = mapsList[index].id;

					actionsArray.push(new DisplayOverlayFromStoreAction({ id: overlay, mapId: mapId }));
				}

				actionsArray.push(new SynchronizeMapsAction({ mapId: mapsList[0].id }));

				return actionsArray;
			}
			else {
				const layoutIndex = layoutOptions.findIndex(({ mapsCount }: MapsLayout) => mapsCount === validOverlays.length);
				return [new SetPendingOverlaysAction(validOverlays), new ChangeLayoutAction(layoutIndex)];
			}
		});

	/**
	 * @type Effect
	 * @name displayPendingOverlaysOnChangeLayoutSuccess$
	 * @ofType SetLayoutSuccess
	 * @dependencies map
	 * @filter there is at least one pending overlay
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	displayPendingOverlaysOnChangeLayoutSuccess$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_LAYOUT_SUCCESS)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]) => mapState.pendingOverlays.length > 0)
		.mergeMap(([action, mapState]) => {
			const actionsArray = [];

			for (let index = 0; index < mapState.pendingOverlays.length; index++) {
				let overlay = mapState.pendingOverlays[index];
				let mapId = mapState.mapsList[index].id;

				actionsArray.push(new DisplayOverlayFromStoreAction({ id: overlay, mapId: mapId }));
			}

			actionsArray.push(new SynchronizeMapsAction({ mapId: mapState.mapsList[0].id }));

			return actionsArray;
		});

	@Effect()
	removePendingOverlayOnDisplay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.includes(action.payload.id))
		.map(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => {
			return new RemovePendingOverlayAction(action.payload.id);
		});

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public casesService: CasesService,
				public overlaysService: OverlaysService) {
	}

}
