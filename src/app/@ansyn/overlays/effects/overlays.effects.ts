import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	GoNextDisplayAction,
	GoPrevDisplayAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	OverlaysMarkupAction,
	RedrawTimelineAction,
	RequestOverlayByIDFromBackendAction,
	SetTimelineStateAction,
	UpdateOverlaysCountAction
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Action, Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector } from '../reducers/overlays.reducer';
import { Overlay } from '../models/overlay.model';
import { unionBy } from 'lodash';
import 'rxjs/add/operator/share';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { coreStateSelector, ICoreState, SetToastMessageAction } from '@ansyn/core';
import { SetOverlaysStatusMessage } from '@ansyn/overlays/actions/overlays.actions';
import { overlaysStatusMessages } from '../reducers/index';

@Injectable()
export class OverlaysEffects {

	/**
	 * @type Effect
	 * @name onOverlaysMarkupChanged$
	 * @ofType OverlaysMarkupAction
	 */
	@Effect({ dispatch: false })
	onOverlaysMarkupChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.share();

	/**
	 * @type Effect
	 * @name onRedrawTimeline$
	 * @ofType RedrawTimelineAction
	 */
	@Effect({ dispatch: false })
	onRedrawTimeline$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.REDRAW_TIMELINE)
		.share();

	/**
	 * @type Effect
	 * @name loadOverlays$
	 * @ofType LoadOverlaysAction
	 * @action LoadOverlaysSuccessAction
	 */
	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.switchMap(([action, { favoriteOverlays }]: [LoadOverlaysAction, ICoreState]) => {
			return this.overlaysService.search(action.payload)
				.mergeMap((overlays: OverlaysFetchData) => {
					if (Array.isArray(overlays.errors) && overlays.errors.length > 0) {
						return [new LoadOverlaysSuccessAction([]),
							new SetOverlaysStatusMessage('Error on overlays request')];
					}

					const overlaysResult = unionBy(overlays.data, favoriteOverlays, o => o.id);
					const actions: Array<any> = [new LoadOverlaysSuccessAction(overlaysResult)];

					overlays.errors.forEach(error => {
						actions.push(new SetToastMessageAction({ toastText: error.message, showWarningIcon: true }));
					});

					// if data.length != fetchLimit that means only duplicate overlays removed
					if (!overlays.data || overlays.data.length === 0) {
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.noOverLayMatchQuery));
					} else if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
						// TODO: replace when design is available
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.overLoad.replace('$overLoad', overlays.data.length.toString())));
					} else {
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.nullify));
					}

					return actions;
				})
				.catch(() => Observable.from([new LoadOverlaysSuccessAction([]), new SetOverlaysStatusMessage('Error on overlays request')]));
		});

	/**
	 * @type Effect
	 * @name onRequestOverlayByID$
	 * @ofType RequestOverlayByIDFromBackendAction
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$
		.ofType<RequestOverlayByIDFromBackendAction>(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId, action.payload.sourceType) // this.overlaysService.fetchData("",action.payload)
				.map((overlay: Overlay) => new DisplayOverlayAction({
					overlay,
					mapId: action.payload.mapId,
					ignoreRotation: true
				}));
		});

	/**
	 * @type Effect
	 * @name initTimelineState$
	 * @ofType LoadOverlaysAction
	 * @action SetTimelineStateAction
	 */
	@Effect()
	initTimelineState$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.map((action: LoadOverlaysAction) => {
			const from = new Date(action.payload.time.from);
			const to = new Date(action.payload.time.to);
			const state = { from, to };
			return new SetTimelineStateAction({ state });
		});

	/**
	 * @type Effect
	 * @name goPrevDisplay$
	 * @ofType GoPrevDisplayAction
	 * @dependencies overlays
	 * @filter Exists a previous overlay
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	goPrevDisplay$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType<GoPrevDisplayAction>(OverlaysActionTypes.GO_PREV_DISPLAY)
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index - 1];
		})
		.filter(prevOverlayId => Boolean(prevOverlayId))
		.map(prevOverlayId => new DisplayOverlayFromStoreAction({ id: prevOverlayId }));

	/**
	 * @type Effect
	 * @name goNextDisplay$
	 * @ofType GoNextDisplayAction
	 * @dependencies overlays
	 * @filter Exists a next overlay
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	goNextDisplay$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType<GoNextDisplayAction>(OverlaysActionTypes.GO_NEXT_DISPLAY)
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index + 1];
		})
		.filter(nextOverlayId => Boolean(nextOverlayId))
		.map(nextOverlayId => new DisplayOverlayFromStoreAction({ id: nextOverlayId }));

	/**
	 * @type Effect
	 * @name drops$
	 * @description this method parse overlays for display ( drops )
	 * @ofType LoadOverlaysAction, LoadOverlaysSuccessAction, SetFilteredOverlaysAction, SetSpecialObjectsActionStore
	 * @dependencies overlays
	 */

	@Effect({ dispatch: false })
	drops$: Observable<any[]> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS,
			OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS,
			OverlaysActionTypes.SET_FILTERED_OVERLAYS,
			OverlaysActionTypes.SET_SPECIAL_OBJECTS)
		.withLatestFrom(this.store$.select(overlaysStateSelector))
		.map(([action, overlays]: [Action, IOverlaysState]) => {
			return OverlaysService.parseOverlayDataForDisplay(overlays)
		});

	/**
	 * @type Effect
	 * @name dropsCount$
	 * @description this method should calculate drops count
	 * @ofType LoadOverlaysAction, LoadOverlaysSuccessAction, SetFilteredOverlaysAction, SetSpecialObjectsActionStore
	 * @action UpdateOverlaysCountAction
	 */

	@Effect()
	dropsCount$: Observable<UpdateOverlaysCountAction> = this.drops$
		.map(drops => new UpdateOverlaysCountAction(drops[0].data.length));


	/**
	 * @type Effect
	 * @name dropCountWatcher
	 * @description this method should fire notification when no overlays are available due to filters.
	 * @ofType UpdateOverlaysCountAction
	 * @action SetOverlaysStatusMessage
	 */

	@Effect()
	dropCountWatcher$: Observable<SetOverlaysStatusMessage> = this.actions$
		.ofType<UpdateOverlaysCountAction>(OverlaysActionTypes.UPDATE_OVERLAYS_COUNT)
		.withLatestFrom(this.store$.select(overlaysStateSelector))
		.map(([{ payload }, { overlays, statusMessage }]: [UpdateOverlaysCountAction, IOverlaysState]) => {
			const isMessageActive = statusMessage === overlaysStatusMessages.noOverLayMatchFilters;
			const isConditionMet = overlays.size > 0 && payload === 0;
			const turnOn = !statusMessage && isConditionMet;
			const turnOff = !isConditionMet && isMessageActive;
			return { turnOn, turnOff };
		})
		.filter(({ turnOn, turnOff }) => turnOn || turnOff)
		.map(({ turnOn }) => {
			const payload = turnOn ? overlaysStatusMessages.noOverLayMatchFilters : overlaysStatusMessages.nullify;
			return new SetOverlaysStatusMessage(payload);
		});

	/**
	 * @type Effect
	 * @name timelineRedraw$
	 * @description this method should redraw timeline on changes
	 * @ofType SetTimelineStateAction
	 * @filter noRedraw value
	 * @action RedrawTimelineAction
	 */

	@Effect()
	timelineRedraw$: Observable<RedrawTimelineAction> = this.actions$
		.ofType(OverlaysActionTypes.SET_TIMELINE_STATE)
		.filter(({ payload }: SetTimelineStateAction) => !payload.noRedraw)
		.map(() => new RedrawTimelineAction());


	constructor(protected actions$: Actions,
				protected store$: Store<IOverlaysState>,
				protected overlaysService: OverlaysService) {
	}


}
