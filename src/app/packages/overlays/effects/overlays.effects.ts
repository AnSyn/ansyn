
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
		.ofType(overlay.OverlaysActionTypes.LOAD_OVERLAYS)
		.switchMap((action) => {
			return this.overlaysService.fetchData("",action.payload)
				.map(data => {
					data.forEach(item => {
						item.date = item.photoTime
					});
					return new overlay.LoadOverlaysSuccessAction(data);
				});
		});



 	@Effect({ dispatch: false })
 	demo$: Observable<Action> = this.actions$
		  	.ofType(overlay.OverlaysActionTypes.DEMO)
		  	.switchMap( action => {
      			return Observable.empty();
  			});
}
