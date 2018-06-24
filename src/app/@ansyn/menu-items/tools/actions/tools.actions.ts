import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { ImageManualProcessArgs, OverlayDisplayMode, OverlaysManualProcessArgs } from '@ansyn/core/models/case.model';
import { AnnotationProperties, SubMenuEnum } from '../reducers/tools.reducer';
import { AnnotationMode } from '@ansyn/core/models/visualizers/annotations.model';
import { toolsFlags } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { FeatureCollection } from 'geojson';

export const ToolsActionsTypes = {
	START_MOUSE_SHADOW: type('[Tools] start mouse shadow'),
	STOP_MOUSE_SHADOW: type('[Tools] stop mouse shadow'),
	UPDATE_TOOLS_FLAGS: type('UPDATE_TOOLS_FLAGS'),
	PULL_ACTIVE_CENTER: type('PULL_ACTIVE_CENTER'),
	SET_ACTIVE_CENTER: type('SET_ACTIVE_CENTER'),
	SET_PIN_LOCATION_MODE: type('SET_PIN_LOCATION_MODE'),
	GO_TO: type('GO_TO'), // Give better name
	GO_TO_INPUT_CHANGED: type('GO_TO_INPUT_CHANGED'),
	SHOW_OVERLAYS_FOOTPRINT: type('SHOW_OVERLAYS_FOOTPRINT'),
	SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE: type('SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE'),
	SET_AUTO_IMAGE_PROCESSING: type('SET_AUTO_IMAGE_PROCESSING'),
	SET_MANUAL_IMAGE_PROCESSING: type('SET_MANUAL_IMAGE_PROCESSING'),
	SET_AUTO_IMAGE_PROCESSING_SUCCESS: type('SET_AUTO_IMAGE_PROCESSING_SUCCESS'),
	SET_MEASURE_TOOL_STATE: type('[tools] SET_MEASURE_TOOL_STATE'),
	ENABLE_IMAGE_PROCESSING: type('ENABLE_IMAGE_PROCESSING'),
	DISABLE_IMAGE_PROCESSING: type('DISABLE_IMAGE_PROCESSING'),
	MAP_GEO_ENABLED_MODE_CHANGED: type('MAP_GEO_ENABLED_MODE_CHANGED'),
	ANNOTATION_SET_PROPERTIES: type('ANNOTATION_SET_PROPERTIES'),
	ANNOTATIONS_SET_LAYER: type('ANNOTATIONS_SET_LAYER'),
	UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS: type('UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS'),
	SET_SUB_MENU: type('SET_SUB_MENU'),
	STORE: {
		SET_ANNOTATION_MODE: type('SET_ANNOTATION_MODE')
	}

};

export class SetAnnotationsLayer implements Action {
	type = ToolsActionsTypes.ANNOTATIONS_SET_LAYER;

	constructor(public payload: FeatureCollection<any>) {
	}
}

export class UpdateOverlaysManualProcessArgs implements Action {
	type = ToolsActionsTypes.UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS;

	constructor(public payload: { override?: boolean, data: OverlaysManualProcessArgs }) {

	}
}

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

export class UpdateToolsFlags implements Action {
	type = ToolsActionsTypes.UPDATE_TOOLS_FLAGS;

	constructor(public payload: { key: toolsFlags, value: boolean }[]) {
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

	constructor(public payload: ImageManualProcessArgs ) {
	};
}

export class AnnotationSetProperties implements Action {
	type = ToolsActionsTypes.ANNOTATION_SET_PROPERTIES;

	constructor(public payload: AnnotationProperties) {

	}
}

export class SetSubMenu implements Action {
	type = ToolsActionsTypes.SET_SUB_MENU;

	constructor(public payload: SubMenuEnum) {

	}
}

export type ToolsActions =
	UpdateOverlaysManualProcessArgs
	| StartMouseShadow
	| StopMouseShadow
	| UpdateToolsFlags
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
	| SetAnnotationMode
	| SetMapGeoEnabledModeToolsActionStore
	| SetMeasureDistanceToolState
	| SetSubMenu;
