
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';

import { Injectable,Inject } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';

import { LoadOverlaysSuccessAction, OverlaysActionTypes } from '../actions/overlays.actions';

import { OverlaysService, OverlaysConfig } from '../services/overlays.service';

import { IOverlaysConfig } from '../models/overlays.config';


@Injectable()
export class OverlaysEffects {

	constructor(private actions$: Actions,
			private overlaysService: OverlaysService,
			@Inject(OverlaysConfig) private config: IOverlaysConfig ) {

	}
	@Effect({dispatch: false})
	onRedrawTimeline$: Observable<boolean> = this.actions$
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
						item.date = item.photoTime
					});
					return new LoadOverlaysSuccessAction(data);
				});
		});

 	@Effect({ dispatch: false })
 	demo$: Observable<Action> = this.actions$
		  	.ofType(OverlaysActionTypes.DEMO)
		  	.switchMap( action => {
      			return Observable.empty();
  			});
}
