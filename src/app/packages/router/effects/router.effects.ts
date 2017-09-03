import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { RouterActionTypes } from '../actions/router.actions';
import { AnsynRouterService } from '../services/router.service';

@Injectable()
export class RouterEffects {
	constructor(private actions$: Actions, private ansynRouterService: AnsynRouterService){}
}
