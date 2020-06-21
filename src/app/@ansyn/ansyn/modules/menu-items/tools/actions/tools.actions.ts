import { Action } from '@ngrx/store';
import { IVisualizerEntity, IVisualizerStyle } from '@ansyn/imagery';
import { SubMenuEnum, toolsFlags, IMeasureData, IMeasureDataOptions } from '../reducers/tools.reducer';
import { type } from '../../../core/utils/type';
import { OverlayDisplayMode } from '../overlays-display-mode/overlays-display-mode.component';
import { AnnotationMode, IUpdateFeatureEvent } from '@ansyn/ol';

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
	SET_MANUAL_IMAGE_PROCESSING: type('SET_MANUAL_IMAGE_PROCESSING'),
	MAP_GEO_ENABLED_MODE_CHANGED: type('MAP_GEO_ENABLED_MODE_CHANGED'),
	ANNOTATION_SET_PROPERTIES: type('ANNOTATION_SET_PROPERTIES'),
	SET_SUB_MENU: type('SET_SUB_MENU'),
	MEASURES: {
		SET_MEASURE_TOOL_STATE: type('[tools] SET_MEASURE_TOOL_STATE'),
		CREATE_MEASURE_DATA: type('[tools] CREATE_MEASURE_DATA'),
		REMOVE_MEASURE_DATA: type('[tools] REMOVE_MEASURE_DATA'),
		ADD_MEASURE: type('[tools] ADD_MEASURE'),
		REMOVE_MEASURE: type('[tools] REMOVE_MEASURE'),
		UPDATE_MEASURE_DATE_OPTIONS: type('[tools] UPDATE_MEASURE_DATA_OPTIONS')
	},
	STORE: {
		SET_ANNOTATION_MODE: type('SET_ANNOTATION_MODE')
	},
	SET_ACTIVE_ANNOTATION_LAYER: 'SET_ACTIVE_ANNOTATION_LAYER',
	CLEAR_ACTIVE_TOOLS: 'CLEAR_ACTIVE_TOOLS',
	HIDE_MEASURE_PANEL: type('HIDE_MEASURE_PANEL'),

	ANNOTATION_REMOVE_FEATURE: 'ANNOTATION_REMOVE_FEATURE',
	ANNOTATION_UPDATE_FEATURE: 'ANNOTATION_UPDATE_FEATURE'
};

export class StartMouseShadow implements Action {
	type = ToolsActionsTypes.START_MOUSE_SHADOW;

	constructor(public payload?: { updateTools?: boolean, fromUser?: boolean }) {
		// code...
	}
}

export class SetAnnotationMode implements Action {
	type = ToolsActionsTypes.STORE.SET_ANNOTATION_MODE;

	constructor(public payload: { annotationMode: AnnotationMode, mapId?: string }) {

	}
}

export class StopMouseShadow implements Action {
	type = ToolsActionsTypes.STOP_MOUSE_SHADOW;

	constructor(public payload?: { updateTools?: boolean, fromUser?: boolean }) {
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

	constructor(public payload: { coordinates: number[], mapSearchBoxSearch?: boolean }) {
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

export class SetMeasureDistanceToolState implements Action {
	type = ToolsActionsTypes.MEASURES.SET_MEASURE_TOOL_STATE;

	constructor(public payload: boolean) {
	}
}

export class CreateMeasureDataAction implements Action {
	type = ToolsActionsTypes.MEASURES.CREATE_MEASURE_DATA;

	constructor(public payload: { mapId: string }) {
	}
}

export class RemoveMeasureDataAction implements Action {
	type = ToolsActionsTypes.MEASURES.REMOVE_MEASURE_DATA;

	constructor(public payload: { mapId: string }) {
	}
}

export class UpdateMeasureDataOptionsAction implements Action {
	type = ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATE_OPTIONS;

	constructor(public payload: {
		mapId: string,
		options: Partial<IMeasureDataOptions>
	}) {
	}
}

export class AddMeasureAction implements Action {
	type = ToolsActionsTypes.MEASURES.ADD_MEASURE;

	constructor(public payload: {
		mapId: string,
		measure: IVisualizerEntity
	}) {
	}
}

export class RemoveMeasureAction implements Action {
	type = ToolsActionsTypes.MEASURES.REMOVE_MEASURE;

	constructor(public payload: {
		mapId: string;
		measureId?: string;
	}) {
	}
}

export class AnnotationSetProperties implements Action {
	type = ToolsActionsTypes.ANNOTATION_SET_PROPERTIES;

	constructor(public payload: Partial<IVisualizerStyle>) {

	}
}

export class SetSubMenu implements Action {
	type = ToolsActionsTypes.SET_SUB_MENU;

	constructor(public payload: SubMenuEnum) {

	}
}

export class ClearActiveInteractionsAction implements Action {
	type = ToolsActionsTypes.CLEAR_ACTIVE_TOOLS;

	constructor(public payload?: { skipClearFor: Array<any> }) {

	}
}

export class AnnotationRemoveFeature implements Action {
	type = ToolsActionsTypes.ANNOTATION_REMOVE_FEATURE;

	constructor(public payload: string) {

	};
}

export class AnnotationUpdateFeature implements Action {
	type = ToolsActionsTypes.ANNOTATION_UPDATE_FEATURE;

	constructor(public payload: IUpdateFeatureEvent) {

	};
}

export type ToolsActions =
	StartMouseShadow
	| StopMouseShadow
	| UpdateToolsFlags
	| PullActiveCenter
	| SetActiveCenter
	| SetPinLocationModeAction
	| GoToAction
	| ShowOverlaysFootprintAction
	| SetActiveOverlaysFootprintModeAction
	| SetMapGeoEnabledModeToolsActionStore
	| SetAnnotationMode
	| SetMapGeoEnabledModeToolsActionStore
	| SetMeasureDistanceToolState
	| SetSubMenu
	| ClearActiveInteractionsAction;
