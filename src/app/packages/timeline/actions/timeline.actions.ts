/**
 * Created by ohad1 on 02/04/2017.
 */

import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { Overlay } from '../models/overlay.model';

export const ActionTypes = {
	SELECT_OVERLAY: type('[Overlay] Select Overlay'),
	UNSELECT_OVERLAY: type('[Overlay] Unselect Overlay'),
	LOAD_OVERLAYS: type('[Overlay] Load Overlays'),
	LOAD_OVERLAYS_SUCCESS: type('[Overlay] Load Overlays Success'),
	LOAD_OVERLAYS_FAIL: type('[Overlay] Load Overlays Failed'),
	DEMO: type('[Overlay] demo')

}

export class SelectOverlayAction implements Action {
	type = ActionTypes.SELECT_OVERLAY;

	constructor	(public payload: Overlay){}
}

export class UnSelectOverlayAction implements Action {
	type = ActionTypes.UNSELECT_OVERLAY;
	constructor (public payload: Overlay){}
}

export class LoadOverlaysAction implements Action {
	type = ActionTypes.LOAD_OVERLAYS;
	constructor(){}
}

export class LoadOverlaysSuccessAction implements Action {
	type = ActionTypes.LOAD_OVERLAYS_SUCCESS;
	constructor (public payload: Overlay[]){}
}

export class LoadOverlaysFailAction implements Action {
	type = ActionTypes.LOAD_OVERLAYS_FAIL;
	constructor(public payload: Overlay[]){}
}

export class DemoAction implements Action {     
	type = ActionTypes.DEMO;
	constructor(public payload: any) {     
    	console.log(payload);                                
    }
}

export type Actions
	= SelectOverlayAction
	| UnSelectOverlayAction
	| LoadOverlaysAction
	| LoadOverlaysSuccessAction
	| LoadOverlaysFailAction
	| DemoAction;
