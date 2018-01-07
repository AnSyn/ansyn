import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { OverlayDisplayMode } from '@ansyn/core/models/case.model';
import { AnnotationMode } from '../reducers/tools.reducer';

export type AnnotationAgentOperation = 'addLayer' | 'show' | 'createInteraction' | 'removeInteraction' |
	'changeLine' | 'changeStrokeColor' | 'changeFillColor' |
	'refreshDrawing' | 'endDrawing' | 'removeLayer';

export type AnnotationAgentRelevantMap = 'all' | 'active' | 'others';

export interface AnnotationVisualizerAgentPayload {
	operation: AnnotationAgentOperation;
	relevantMaps: AnnotationAgentRelevantMap;
	value?: any;
	mode?: AnnotationMode;
}


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
	SET_MANUAL_IMAGE_PROCESSING: type('SET_MANUAL_IMAGE_PROCESSING'),
	SET_AUTO_IMAGE_PROCESSING_SUCCESS: type('SET_AUTO_IMAGE_PROCESSING_SUCCESS'),
	SET_MEASURE_TOOL_STATE: type('[tools] SET_MEASURE_TOOL_STATE'),
	ENABLE_IMAGE_PROCESSING: type('ENABLE_IMAGE_PROCESSING'),
	DISABLE_IMAGE_PROCESSING: type('DISABLE_IMAGE_PROCESSING'),
	SET_MANUAL_IMAGE_PROCESSING_ARGUMENTS: type('SET_MANUAL_IMAGE_PROCESSING_ARGUMENTS'),
	MAP_GEO_ENABLED_MODE_CHANGED: type('MAP_GEO_ENABLED_MODE_CHANGED'),
	ANNOTATION_VISUALIZER_AGENT: type('ANNOTATION_VISUALIZER_AGENT'),
	SET_AUTOCLOSE_MENU: type('SET_AUTOCLOSE_MENU'),
	FLAGS: {
		ANNOTATION_OPEN: type('ANNOTATION_OPEN'),
		ANNOTATION_CLOSE: type('ANNOTATION_CLOSE')
	},
	STORE: {
		SET_ANNOTATION_MODE: type('SET_ANNOTATION_MODE')
	}

};

export class StartMouseShadow implements Action {
	type = ToolsActionsTypes.START_MOUSE_SHADOW;

	constructor(public payload?: { updateTools: boolean }) {
		// code...
	}
}

export class SetAnnotationMode implements Action {
	type = ToolsActionsTypes.STORE.SET_ANNOTATION_MODE;

	constructor(public payload?: AnnotationMode) {

	}
}

export class StopMouseShadow implements Action {
	type = ToolsActionsTypes.STOP_MOUSE_SHADOW;

	constructor(public payload?: { updateTools: boolean }) {
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

export class SetMeasureDistanceToolState implements Action {
	type = ToolsActionsTypes.SET_MEASURE_TOOL_STATE;

	constructor(public payload: boolean) {
	}
}

export class DisableImageProcessing implements Action {
	type = ToolsActionsTypes.DISABLE_IMAGE_PROCESSING;

	constructor(public payload?: any) {
	};
}

export class EnableImageProcessing implements Action {
	type = ToolsActionsTypes.ENABLE_IMAGE_PROCESSING;

	constructor(public payload?: any) {
	};
}

export class SetManualImageProcessing implements Action {
	type = ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING;

	constructor(public payload: { processingParams: Object }) {
	};
}

export class SetManualImageProcessingArguments implements Action {
	type = ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING_ARGUMENTS;

	constructor(public payload: { processingParams: Object }) {
	};
}

export class AnnotationVisualizerAgentAction implements Action {
	type = ToolsActionsTypes.ANNOTATION_VISUALIZER_AGENT;

	constructor(public payload: AnnotationVisualizerAgentPayload) {
	}
}

export class SetAutoCloseMenu implements Action {
	type = ToolsActionsTypes.SET_AUTOCLOSE_MENU;

	constructor(public payload: boolean) {
	}
}

export class AnnotationOpen implements Action {
	type = ToolsActionsTypes.FLAGS.ANNOTATION_OPEN;

	constructor(public payload: boolean) {

	}
}

export class AnnotationClose implements Action {
	type = ToolsActionsTypes.FLAGS.ANNOTATION_CLOSE;

	constructor(public payload: boolean) {

	}
}

export type ToolsActions =
	StartMouseShadow
	| StopMouseShadow
	| DisableMouseShadow
	| EnableMouseShadow
	| PullActiveCenter
	| SetActiveCenter
	| SetPinLocationModeAction
	| GoToAction
	| ShowOverlaysFootprintAction
	| SetActiveOverlaysFootprintModeAction
	| SetAutoImageProcessing
	| DisableImageProcessing
	| EnableImageProcessing
	| SetAutoImageProcessingSuccess
	| SetMapGeoEnabledModeToolsActionStore
	| SetManualImageProcessingArguments
	| AnnotationVisualizerAgentAction
	| AnnotationOpen
	| AnnotationClose
	| SetAutoCloseMenu
	| SetAnnotationMode
	| SetMapGeoEnabledModeToolsActionStore
	| SetMeasureDistanceToolState;
