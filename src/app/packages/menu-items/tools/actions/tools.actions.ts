import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { OverlayDisplayMode } from '@ansyn/core/models/case.model';

export const ToolsActionsTypes = {
	START_MOUSE_SHADOW: type('[Tools] start mouse shadow'),
	STOP_MOUSE_SHADOW: type('[Tools] stop mouse shadow'),
	DISABLE_MOUSE_SHADOW: type('DISABLE_MOUSE_SHADOW'),
	ENABLE_MOUSE_SHADOW: type('ENABLE_MOUSE_SHADOW'),
	PULL_ACTIVE_CENTER: type('PULL_ACTIVE_CENTER'),
	SET_ACTIVE_CENTER: type('SET_ACTIVE_CENTER'),
	SET_PIN_LOCATION_MODE: type('SET_PIN_LOCATION_MODE'),
	GO_TO: type('GO_TO'), // Give better name
	GO_TO_INPUT_CHANGED: type('GO_TO_INPUT_CHANGED'),
	GO_TO_EXPAND: type('GO_TO_EXPAND'),
	SHOW_OVERLAYS_FOOTPRINT: type('SHOW_OVERLAYS_FOOTPRINT'),
	SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE: type('SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE'),
	SET_AUTO_IMAGE_PROCESSING: type('SET_AUTO_IMAGE_PROCESSING'),
	SET_AUTO_IMAGE_PROCESSING_SUCCESS: type('SET_AUTO_IMAGE_PROCESSING_SUCCESS'),
	ENABLE_AUTO_IMAGE_PROCESSING: type('ENABLE_AUTO_IMAGE_PROCESSING'),
	DISABLE_AUTO_IMAGE_PROCESSING: type('DISABLE_AUTO_IMAGE_PROCESSING'),
	MAP_GEO_ENABLED_MODE_CHANGED: type('MAP_GEO_ENABLED_MODE_CHANGED'),
	ANNOTATION_VISUALIZER_AGENT: type('ANNOTATION_VISUALIZER_AGENT'),
	SET_AUTOCLOSE_MENU: type('SET_AUTOCLOSE_MENU')

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

export class DisableMouseShadow implements Action {
	type = ToolsActionsTypes.DISABLE_MOUSE_SHADOW;

	constructor(public payload?: any) {
	};
}

export class EnableMouseShadow implements Action {
	type = ToolsActionsTypes.ENABLE_MOUSE_SHADOW;

	constructor(public payload?: any) {
	};
}

export class PullActiveCenter implements Action {
	type = ToolsActionsTypes.PULL_ACTIVE_CENTER;

	constructor(public payload?: any) {
	};
}

export class SetActiveCenter implements Action {
	type = ToolsActionsTypes.SET_ACTIVE_CENTER;

	constructor(public payload: number[]) {
	};
}

export class SetPinLocationModeAction implements Action {
	type = ToolsActionsTypes.SET_PIN_LOCATION_MODE;

	constructor(public payload: boolean) {
	};
}

export class GoToAction implements Action {
	type = ToolsActionsTypes.GO_TO;

	constructor(public payload: number[]) {
	};
}

export class GoToExpandAction implements Action {
	type = ToolsActionsTypes.GO_TO_EXPAND;

	constructor(public payload: boolean) {
	}
}

export class GoToInputChangeAction implements Action {
	type = ToolsActionsTypes.GO_TO_INPUT_CHANGED;

	constructor(public payload: any[]) {
	}
}

export class ShowOverlaysFootprintAction implements Action {
	type = ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT;

	constructor(public payload: OverlayDisplayMode) {
	};
}

export class SetActiveOverlaysFootprintModeAction implements Action {
	type = ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE;

	constructor(public payload: OverlayDisplayMode) {
	};
}

export class SetMapGeoEnabledModeToolsActionStore implements Action {
	type = ToolsActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED;

	constructor(public payload: boolean) {
	}
}

export class SetAutoImageProcessing implements Action {
	type = ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING;

	constructor(public payload?: any) {
		// code...
	}
}

export class SetAutoImageProcessingSuccess implements Action {
	type = ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS;

	constructor(public payload: boolean) {
		// code...
	}
}

export class DisableImageProcessing implements Action {
	type = ToolsActionsTypes.DISABLE_AUTO_IMAGE_PROCESSING;

	constructor(public payload?: any) {
	};
}

export class EnableImageProcessing implements Action {
	type = ToolsActionsTypes.ENABLE_AUTO_IMAGE_PROCESSING;

	constructor(public payload?: any) {
	};
}

export class AnnotationVisualizerAgentAction implements Action {
	type = ToolsActionsTypes.ANNOTATION_VISUALIZER_AGENT;

	constructor(public payload: any) {
	}
}

export class SetAutoCloseMenu implements Action {
	type = ToolsActionsTypes.SET_AUTOCLOSE_MENU;

	constructor(public payload: boolean) {
	}
}

export type ToolsActions =
	StartMouseShadow
	| StopMouseShadow
	| DisableMouseShadow
	| EnableMouseShadow
	| PullActiveCenter
	|
	SetActiveCenter
	| SetPinLocationModeAction
	| GoToAction
	| ShowOverlaysFootprintAction
	| SetActiveOverlaysFootprintModeAction
	|
	SetAutoImageProcessing
	| DisableImageProcessing
	| EnableImageProcessing
	| SetAutoImageProcessingSuccess
	| SetMapGeoEnabledModeToolsActionStore;
