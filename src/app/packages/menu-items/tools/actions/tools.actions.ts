import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';

export const ToolsActionsTypes = {
	START_MOUSE_SHADOW: type('[Tools] start mouse shadow'),
	STOP_MOUSE_SHADOW: type('[Tools] stop mouse shadow'),
	DISABLE_MOUSE_SHADOW: type('DISABLE_MOUSE_SHADOW'),
	ENABLE_MOUSE_SHADOW: type('ENABLE_MOUSE_SHADOW'),
	PULL_ACTIVE_CENTER: type('PULL_ACTIVE_CENTER'),
	SET_ACTIVE_CENTER: type('SET_ACTIVE_CENTER'),
	SET_PIN_LOCATION_MODE: type('SET_PIN_LOCATION_MODE'),
	GO_TO: type('GO_TO'),
	TOGGLE_IMAGE_PROCESSING: type('TOGGLE_IMAGE_PROCESSING'),
	TOGGLE_IMAGE_PROCESSING_END: type('TOGGLE_IMAGE_PROCESSING_END'),	
	ENABLE_IMAGE_PROCESSING: type('ENABLE_IMAGE_PROCESSING'),		
	DISABLE_IMAGE_PROCESSING: type('DISABLE_IMAGE_PROCESSING')	
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

export class PullActiveCenter implements  Action {
	type = ToolsActionsTypes.PULL_ACTIVE_CENTER;
	constructor(public payload?:any){};
}
export class SetActiveCenter implements  Action {
	type = ToolsActionsTypes.SET_ACTIVE_CENTER;
	constructor(public payload: number[]){};
}
export class SetPinLocationModeAction implements  Action {
	type = ToolsActionsTypes.SET_PIN_LOCATION_MODE;
	constructor(public payload: boolean) {};
}

export class GoToAction implements  Action {
	type = ToolsActionsTypes.GO_TO;
	constructor(public payload: number[]) {};
}

export class ToggleImageProcessing implements Action {
	type = ToolsActionsTypes.TOGGLE_IMAGE_PROCESSING;
	constructor(public payload?: any) {
		// code...
	}
}

export class ToggleImageProcessingEnd implements Action {
	type = ToolsActionsTypes.TOGGLE_IMAGE_PROCESSING_END;
	constructor(public payload: boolean) {
		// code...
	}
}

export class DisableImageProcessing implements  Action {
	type = ToolsActionsTypes.DISABLE_IMAGE_PROCESSING;
	constructor(public payload?:any){};
}

export class EnableImageProcessing implements  Action {
	type = ToolsActionsTypes.ENABLE_IMAGE_PROCESSING;
	constructor(public payload?:any){};
}

export type ToolsActions = StartMouseShadow | StopMouseShadow | DisableMouseShadow | EnableMouseShadow | PullActiveCenter | SetActiveCenter  | ToggleImageProcessing |
							DisableImageProcessing | EnableImageProcessing | ToggleImageProcessingEnd;

