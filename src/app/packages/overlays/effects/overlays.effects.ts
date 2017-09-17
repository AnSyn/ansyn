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
	RequestOverlayByIDFromBackendAction,
	SetTimelineStateAction
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Store } from '@ngrx/store';
import { IOverlayState } from '../reducers/overlays.reducer';
import { ICasesState } from '../../menu-items/cases/reducers/cases.reducer';
import { Overlay } from '../models/overlay.model';
import { isEqual, isNil as _isNil } from 'lodash';
import 'rxjs/add/operator/share';

@Injectable()
export class OverlaysEffects {

	@Effect()
	onDisplayOverlayFromStore$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE)
		.withLatestFrom(this.store$.select('overlays'), (action: DisplayOverlayFromStoreAction, state: IOverlayState): any => {
			return { overlay: state.overlays.get(action.payload.id), map_id: action.payload.map_id };
		})
		.map(({ overlay, map_id }: any) => {
			return new DisplayOverlayAction({ overlay, map_id });
		}).share();

	@Effect({ dispatch: false })
	onOverlaysMarkupChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.share();

	@Effect({ dispatch: false })
	onRedrawTimeline$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.REDRAW_TIMELINE)
		.map(() => true)
		.share();

	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.switchMap((action) => {
			return this.overlaysService.search(action.payload)
				.map(data => {
					return new LoadOverlaysSuccessAction(data);
				})
				.catch(() => Observable.of(new LoadOverlaysSuccessAction([])));
		});

	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$
		.ofType(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId) // this.overlaysService.fetchData("",action.payload)
				.map((overlay: Overlay) => {
					return new DisplayOverlayAction({ overlay, map_id: action.payload.map_id });
				});
		});

	@Effect()
	initTimelineStata$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.map((action: LoadOverlaysAction) => {
			const from = new Date(action.payload.from);
			const to = new Date(action.payload.to);
			return new SetTimelineStateAction({ from, to });
		});

	@Effect()
	goPrevDisplay$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType(OverlaysActionTypes.GO_PREV_DISPLAY)
		.withLatestFrom((this.store$.select('overlays').pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index - 1];
		})
		.filter(prevOverlayId => !_isNil(prevOverlayId))
		.map(prevOverlayId => new DisplayOverlayFromStoreAction({ id: prevOverlayId }));

	@Effect()
	goNextDisplay$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType(OverlaysActionTypes.GO_NEXT_DISPLAY)
		.withLatestFrom((this.store$.select('overlays').pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			return filteredOverlays[index + 1];
		})
		.filter(nextOverlayId => !_isNil(nextOverlayId))
		.map(nextOverlayId => new DisplayOverlayFromStoreAction({ id: nextOverlayId }));


	// this method moves the timeline to active displayed overlay if exists in timeline
	@Effect()
	displayOverlaySetTimeline$ = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action: DisplayOverlayAction, overlays: IOverlayState, cases: ICasesState) => {
			const displayedOverlay = overlays.overlays.get(action.payload.overlay.id);
			const timelineState = overlays.timelineState;
			const isActiveMap: boolean = _isNil(action.payload.map_id) || isEqual(cases.selected_case.state.maps.active_map_id, action.payload.map_id);
			return [isActiveMap, displayedOverlay, timelineState];
		})
		.filter(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, any]) => {
			return isActiveMap && displayedOverlay && (displayedOverlay.date < timelineState.from || timelineState.to < displayedOverlay.date);
		})
		.map(([isActiveMap, displayedOverlay, timelineState]: [Overlay, Overlay, any]) => {
			const timeState = this.overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			return new SetTimelineStateAction(timeState);
		})
		.share();

	constructor(private actions$: Actions,
				private store$: Store<IOverlayState>,
				private overlaysService: OverlaysService) {
	}
}
