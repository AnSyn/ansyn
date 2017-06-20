import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';

export const ToolsActionsTypes = {
	START_MOUSE_SHADOW: type('[Tools] start mouse shadow'),
	STOP_MOUSE_SHADOW: type('[Tools] stop mouse shadow'),
	DISABLE_MOUSE_SHADOW: type('DISABLE_MOUSE_SHADOW'),
	ENABLE_MOUSE_SHADOW: type('ENABLE_MOUSE_SHADOW'),
};

export class StartMouseShadow implements Action {
	type = ToolsActionsTypes.START_MOUSE_SHADOW;
	constructor(public payload?: any) {
		// code...
	}
}

export class StopMouseShadow implements Action {
	type = ToolsActionsTypes.STOP_MOUSE_SHADOW;
	constructor(public payload?: any) {
		// code...
	}
}

export class DisableMouseShadow implements  Action {
	type = ToolsActionsTypes.DISABLE_MOUSE_SHADOW;
	constructor(public payload?:any){};
}

export class EnableMouseShadow implements  Action {
	type = ToolsActionsTypes.ENABLE_MOUSE_SHADOW;
	constructor(public payload?:any){};
}

export type ToolsActions = StartMouseShadow | StopMouseShadow | DisableMouseShadow | EnableMouseShadow;
