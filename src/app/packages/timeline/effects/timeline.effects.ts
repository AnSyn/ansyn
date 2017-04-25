
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';

import { Observable ,ObservableInput} from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { of } from 'rxjs/observable/of';

//import * as collection from '../actions/collection';

import { Overlay } from '../models/overlay.model';
import * as overlay from '../actions/timeline.actions';

@Injectable()
export class OverlayEffects {     
	
	constructor(private actions$: Actions){    
		
	}

 	@Effect({ dispatch: false })
 	demo$: Observable<Action> = this.actions$
		  	.ofType(overlay.ActionTypes.DEMO)
	  		.switchMap( action => {     
      			console.log('demo$ effect');
          		return Observable.empty();
          	});                             
}