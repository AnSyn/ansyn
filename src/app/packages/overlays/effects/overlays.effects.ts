import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
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
import { Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector } from '../reducers/overlays.reducer';
import { casesStateSelector, ICasesState } from '../../menu-items/cases/reducers/cases.reducer';
import { Overlay } from '../models/overlay.model';
import { isEqual, isNil as _isNil } from 'lodash';
import 'rxjs/add/operator/share';

@Injectable()
export class OverlaysEffects {

	/**
	 * @type Effect
	 * @name onDisplayOverlayFromStore$
	 * @ofType DisplayOverlayFromStoreAction
	 * @dependencies overlays
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onDisplayOverlayFromStore$: Observable<DisplayOverlayAction> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE)
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action: DisplayOverlayFromStoreAction, state: IOverlaysState): any => {
			return { overlay: state.overlays.get(action.payload.id), map_id: action.payload.map_id };
		})
		.map(({ overlay, map_id }: any) => {
			return new DisplayOverlayAction({ overlay, map_id });
		}).share();

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
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.switchMap((action) => {
			return this.overlaysService.search(action.payload)
				.map(data => new LoadOverlaysSuccessAction(data))
				.catch(() => Observable.of(new LoadOverlaysSuccessAction([])));
		});

	/**
	 * @type Effect
	 * @name onRequestOverlayByID$
	 * @ofType RequestOverlayByIDFromBackendAction
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$
		.ofType(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId) // this.overlaysService.fetchData("",action.payload)
				.map((overlay: Overlay) => new DisplayOverlayAction({ overlay, map_id: action.payload.map_id }));
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
			const from = new Date(action.payload.from);
			const to = new Date(action.payload.to);
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
		.ofType(OverlaysActionTypes.GO_PREV_DISPLAY)
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index - 1];
		})
		.filter(prevOverlayId => !_isNil(prevOverlayId))
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
		.ofType(OverlaysActionTypes.GO_NEXT_DISPLAY)
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index + 1];
		})
		.filter(nextOverlayId => !_isNil(nextOverlayId))
		.map(nextOverlayId => new DisplayOverlayFromStoreAction({ id: nextOverlayId }));


	/**
	 * @type Effect
	 * @name displayOverlaySetTimeline$
	 * @description this method moves the timeline to active displayed overlay if exists in timeline
	 * @ofType DisplayOverlayAction
	 * @dependencies overlays, cases
	 * @filter isActiveMap && displayedOverlay && displayedOverlay is exeeding timelineState
	 * @action SetTimelineStateAction
	 */
	@Effect()
	displayOverlaySetTimeline$ = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(casesStateSelector), (action: DisplayOverlayAction, overlays: IOverlaysState, cases: ICasesState) => {
			const displayedOverlay = overlays.overlays.get(action.payload.overlay.id);
			const timelineState = overlays.timelineState;
			const isActiveMap: boolean = _isNil(action.payload.map_id) || isEqual(cases.selectedCase.state.maps.active_map_id, action.payload.map_id);
			return [isActiveMap, displayedOverlay, timelineState];
		})
		.filter(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, any]) => {
			return isActiveMap && displayedOverlay && (displayedOverlay.date < timelineState.from || timelineState.to < displayedOverlay.date);
		})
		.map(([isActiveMap, displayedOverlay, timelineState]: [Overlay, Overlay, any]) => {
			const state = this.overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			return new SetTimelineStateAction({ state });
		});

	/**
	 * @type Effect
	 * @name drops$
	 * @description this method parse overlays for display ( drops )
	 * @ofType LoadOverlaysAction, LoadOverlaysSuccessAction, SetFiltersAction, SetSpecialObjectsActionStore
	 * @dependencies overlays
	 */

	@Effect({ dispatch: false })
	drops$: Observable<any[]> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS,
			OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS,
			OverlaysActionTypes.SET_FILTERS,
			OverlaysActionTypes.SET_SPECIAL_OBJECTS)
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => overlays)
		.map(OverlaysService.parseOverlayDataForDispaly);

	/**
	 * @type Effect
	 * @name dropsCount$
	 * @description this method should calculate drops count
	 * @ofType LoadOverlaysAction, LoadOverlaysSuccessAction, SetFiltersAction, SetSpecialObjectsActionStore
	 * @action UpdateOverlaysCountAction
	 */

	@Effect()
	dropsCount$: Observable<UpdateOverlaysCountAction> = this.drops$
		.map(drops => new UpdateOverlaysCountAction(drops[0].data.length));


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


	constructor(private actions$: Actions,
				private store$: Store<IOverlaysState>,
				private overlaysService: OverlaysService) {
	}


}
