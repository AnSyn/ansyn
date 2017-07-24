import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable,Inject } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayAction,
	GoNextDisplayAction,
	GoPrevDisplayAction,
	LoadOverlaysAction, LoadOverlaysSuccessAction, OverlaysActionTypes,
	OverlaysMarkupAction, SetTimelineStateAction
} from '../actions/overlays.actions';
import { OverlaysService, OverlaysConfig } from '../services/overlays.service';
import { IOverlaysConfig } from '../models/overlays.config';
import { Store } from '@ngrx/store';
import { IOverlayState } from '../reducers/overlays.reducer';
import { ICasesState } from '../../menu-items/cases/reducers/cases.reducer';
import * as _ from 'lodash';
import { Overlay } from '../models/overlay.model';

@Injectable()
export class OverlaysEffects {

	@Effect({dispatch:false})
	onOverlaysMarkupChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.share();

	@Effect({dispatch: false})
	onRedrawTimeline$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.REDRAW_TIMELINE)
		.map(() => true)
		.share();

	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.switchMap((action) => {
			return this.overlaysService.search(action.payload) //this.overlaysService.fetchData("",action.payload)
				.map(data => {
					return new LoadOverlaysSuccessAction(data);
				});
		});

	@Effect()
	initTimelineStata$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.map((action: LoadOverlaysAction) => {
			const from = new Date(action.payload.from);
			const to = new Date(action.payload.to);
			return new SetTimelineStateAction({from, to})
		});

	@Effect({dispatch: false})
	goPrevDisplay$: Observable<GoPrevDisplayAction> = this.actions$
		.ofType(OverlaysActionTypes.GO_PREV_DISPLAY)
		.share();

	@Effect({dispatch: false})
	goNextDisplay$: Observable<GoNextDisplayAction> = this.actions$
		.ofType(OverlaysActionTypes.GO_NEXT_DISPLAY)
		.share();

	@Effect()
	displayOverlaySetTimeline$ = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action: DisplayOverlayAction, overlays: IOverlayState, cases: ICasesState) => {
			const displayedOverlay = overlays.overlays.get(action.payload.id);
			const timelineState = overlays.timelineState;
			const isActiveMap: boolean = _.isNil(action.payload.map_id) || _.isEqual(cases.selected_case.state.maps.active_map_id, action.payload.map_id);
			return [isActiveMap, displayedOverlay, timelineState];
		})
		.filter(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, any]) => {
			return isActiveMap && displayedOverlay && (displayedOverlay.date < timelineState.from || timelineState.to < displayedOverlay.date);
		})
		.map(([isActiveMap, displayedOverlay, timelineState]:[Overlay, Overlay, any]) => {
			const timeState = this.overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			return new SetTimelineStateAction(timeState);
		})
		.share();

	constructor(private actions$: Actions,
				private store$: Store<IOverlayState>,
				private overlaysService: OverlaysService) {}
}
