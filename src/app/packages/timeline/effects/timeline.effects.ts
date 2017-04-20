
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable ,ObservableInput} from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { empty } from 'rxjs/observable/empty';

//import * as collection from '../actions/collection';

import { Overlay } from '../models/overlay.model';
import * as overlay from '../actions/timeline.actions';

import { TimelineService } from '../services/timeline.service';

@Injectable()
export class OverlayEffects {     
	
	constructor(private actions$: Actions,private timelineService: TimelineService ){    
		
	}

	@Effect()
	loadOverlays$: Observable<Action> = this.actions$
		.ofType(overlay.ActionTypes.LOAD_OVERLAYS)
		.switchMap(() => {    
       		return this.timelineService.fetchData()
       			.map( data => {    
             		/*if(data instanceof Array && !(data[0] instanceof Array)){*/    
       					data.forEach(item=> {    
			       			item.date = item.photoTime
			     		});
       					
       				/*}*/
       				return new overlay.LoadOverlaysSuccessAction(data);
             	});

       		
       	})


 	@Effect({ dispatch: false })
 	demo$: Observable<Action> = this.actions$
		  	.ofType(overlay.ActionTypes.DEMO)
	  		.switchMap( action => {     
      			console.log('demo$ effect');
          		return Observable.empty();
          	});                             
}