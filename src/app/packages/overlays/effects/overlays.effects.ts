
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable,Inject } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	LoadOverlaysAction, LoadOverlaysSuccessAction, OverlaysActionTypes,
	OverlaysMarkupAction, SetTimelineStateAction
} from '../actions/overlays.actions';
import { OverlaysService, OverlaysConfig } from '../services/overlays.service';
import { IOverlaysConfig } from '../models/overlays.config';


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
			return this.overlaysService[this.config.searchByCase ? "getByCase" : "search" ]("",action.payload) //this.overlaysService.fetchData("",action.payload)
				.map(data => {
					data.forEach(item => {
						item.date = item.photoTime;
						item.sourceType = this.config.overlaySource;
						if(item.footprint.geometry){
							item.footprint = item.footprint.geometry;
						}
					});
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

	constructor(private actions$: Actions,
				private overlaysService: OverlaysService,
				@Inject(OverlaysConfig) private config: IOverlaysConfig ) {}
}
