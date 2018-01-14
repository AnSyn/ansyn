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
	SyncOverlaysWithFavoritesOnLoadingAction,
	UpdateOverlaysCountAction
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector } from '../reducers/overlays.reducer';
import { Overlay } from '../models/overlay.model';
import { isNil, unionBy } from 'lodash';
import 'rxjs/add/operator/share';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { UpdateFavoriteOverlaysMetadataAction } from '@ansyn/core/actions/core.actions';

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
			return { overlay: state.overlays.get(action.payload.id), mapId: action.payload.mapId };
		})
		.map(({ overlay, mapId }: any) => {
			return new DisplayOverlayAction({ overlay, mapId });
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
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.switchMap((action) => {
			return this.overlaysService.search(action.payload)
				.mergeMap((overlays: OverlaysFetchData) => {
					const actions: Array<any> = [new SyncOverlaysWithFavoritesOnLoadingAction(overlays.data)];
					// if data.length != fetchLimit that means only duplicate overlays removed
					if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
						// TODO: replace when design is available
						actions.push(new SetToastMessageAction({
							toastText: `Only the latest ${overlays.data.length} results are presented, try to edit search time range.`
						}));
					}
					return actions;
				})
				.catch(() => Observable.of(new LoadOverlaysSuccessAction([])));
		});
	/**
	 * @type Effect
	 * @name syncOverlaysOnLoading$
	 * @ofType SyncOverlaysWithFavoritesOnLoadingAction
	 * @dependencies coreState
	 * @action LoadOverlaysSuccessAction
	 */
	@Effect()
	syncOverlaysOnLoading$: Observable<any> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.SYNC_OVERLAYS_WITH_FAVORITES_ON_LOADING)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.mergeMap(([action, state]: [LoadOverlaysAction, ICoreState]) => {
			// sync overlays: if overlay exist in favorites but not in data fetched from server - take favorite data.
			const overlays = unionBy(action.payload, state.favoriteOverlays, o => o.id);
			// sync favorites: for each favorite - update object using data fetched from server.
			const favorites = state.favoriteOverlays.map(fav => overlays.find(o => o.id === fav.id));
			return [
				new UpdateFavoriteOverlaysMetadataAction(favorites),
				new LoadOverlaysSuccessAction(overlays)
			];
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
				.map((overlay: Overlay) => new DisplayOverlayAction({ overlay, mapId: action.payload.mapId }));
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
		.ofType<GoPrevDisplayAction>(OverlaysActionTypes.GO_PREV_DISPLAY)
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index - 1];
		})
		.filter(prevOverlayId => !isNil(prevOverlayId))
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
		.filter(nextOverlayId => !isNil(nextOverlayId))
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
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => overlays)
		.map(OverlaysService.parseOverlayDataForDisplay);

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
