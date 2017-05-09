/**
 * Created by ohad1 on 02/04/2017.
 */

import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { Overlay } from '../models/overlay.model';

export const OverlaysActionTypes = {
	SELECT_OVERLAY: type('[Overlay] Select Overlay'),
	UNSELECT_OVERLAY: type('[Overlay] Unselect Overlay'),
	LOAD_OVERLAYS: type('[Overlay] Load Overlays'),
	LOAD_OVERLAYS_SUCCESS: type('[Overlay] Load Overlays Success'),
	LOAD_OVERLAYS_FAIL: type('[Overlay] Load Overlays Failed'),
	SET_FILTER: type('[Overlay] Set Filter'),
	CLEAR_FILTER: type('[Overlay] Clear Filter'),
	DISPLAY_OVERLAY: type('[Overlay] Display Overlay'),
	DEMO: type('[Overlay] demo')

}

export class SelectOverlayAction implements Action {
	type = OverlaysActionTypes.SELECT_OVERLAY;

	constructor	(public payload: string){}
}

export class UnSelectOverlayAction implements Action {
	type = OverlaysActionTypes.UNSELECT_OVERLAY;
	constructor (public payload: string){}
}

export class LoadOverlaysAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS;
	constructor(public payload?: any){}
}

export class LoadOverlaysSuccessAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS;
	constructor (public payload: Overlay[]){}
}

export class LoadOverlaysFailAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_FAIL;
	constructor(public payload: Overlay[]){}
}

export class SetFilter implements Action {
	type = OverlaysActionTypes.SET_FILTER;
	constructor(public payload:any){}
}

export class ClearFilter implements Action {
	type = OverlaysActionTypes.CLEAR_FILTER;
	constructor(public payload?: any){}
}

export class DisplayOverlayAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY;
	constructor(public payload: string){}
}

export class DemoAction implements Action {
	type = OverlaysActionTypes.DEMO;
	constructor(public payload: any) {
    	console.log(payload);
    }
}

export type OverlaysActions
	= 	DisplayOverlayAction
	|  	SelectOverlayAction
	|	UnSelectOverlayAction
	| 	LoadOverlaysAction
	| 	LoadOverlaysSuccessAction
	| 	LoadOverlaysFailAction
	|	ClearFilter
	|	SetFilter
	| DemoAction;
