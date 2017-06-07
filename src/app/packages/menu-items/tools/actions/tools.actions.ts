import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';

export const ToolsActionsTypes = {
	START_MOUSE_SHADOW: type('[Tools] start mouse shadow'),
	STOP_MOUSE_SHADOW: type('[Tools] stop mouse shadow')
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

export type ToolsActions = StartMouseShadow | StopMouseShadow;
