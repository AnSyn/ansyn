
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';

import * as overlay from '../actions/overlays.actions';

import { OverlaysService } from '../services/overlays.service';


@Injectable()
export class OverlaysEffects {

	constructor(private actions$: Actions,private overlaysService: OverlaysService ){

	}

	@Effect()
	loadOverlays$: Observable<Action> = this.actions$
		.ofType(overlay.ActionTypes.LOAD_OVERLAYS)
		.switchMap((tmp) => {
			return this.overlaysService.fetchData()
				.map(data => {
					data.forEach(item => {
						item.date = item.photoTime
					});
					return new overlay.LoadOverlaysSuccessAction(data);
				});
		});



 	@Effect({ dispatch: false })
 	demo$: Observable<Action> = this.actions$
		  	.ofType(overlay.ActionTypes.DEMO)
		  	.debug('tmp1')
	  		.switchMap( action => {
      			return Observable.empty();
  			});
}
