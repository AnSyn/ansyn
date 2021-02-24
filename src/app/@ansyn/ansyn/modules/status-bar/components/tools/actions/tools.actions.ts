import { Action } from '@ngrx/store';
import { IVisualizerEntity, IVisualizerStyle } from '@ansyn/imagery';
import { AnnotationMode, IUpdateFeatureEvent } from '@ansyn/ol';
import { IMeasureDataOptions, SubMenuEnum, toolsFlags } from '../models/tools.model';
import { type } from '../../../../core/utils/type';
import { ILogMessage } from '@ansyn/map-facade';

export const ToolsActionsTypes = {
	START_MOUSE_SHADOW: type('[Tools] start mouse shadow'),
	STOP_MOUSE_SHADOW: type('[Tools] stop mouse shadow'),
	UPDATE_TOOLS_FLAGS: type('UPDATE_TOOLS_FLAGS'),
	PULL_ACTIVE_CENTER: type('PULL_ACTIVE_CENTER'),
	SET_ACTIVE_CENTER: type('SET_ACTIVE_CENTER'),
	SET_PIN_LOCATION_MODE: type('SET_PIN_LOCATION_MODE'),
	GO_TO: type('GO_TO'), // Give better name
	GO_TO_INPUT_CHANGED: type('GO_TO_INPUT_CHANGED'),
	SET_MANUAL_IMAGE_PROCESSING: type('SET_MANUAL_IMAGE_PROCESSING'),
	MAP_GEO_ENABLED_MODE_CHANGED: type('MAP_GEO_ENABLED_MODE_CHANGED'),
	SET_MAP_SEARCH_BOX: type('SET_MAP_SEARCH_BOX'),
	ANNOTATION_SET_PROPERTIES: type('ANNOTATION_SET_PROPERTIES'),
	SET_SUB_MENU: type('SET_SUB_MENU'),
	MEASURES: {
		CREATE_MEASURE_DATA: type('[tools] CREATE_MEASURE_DATA'),
		REMOVE_MEASURE_DATA: type('[tools] REMOVE_MEASURE_DATA'),
		ADD_MEASURE: type('[tools] ADD_MEASURE'),
		REMOVE_MEASURE: type('[tools] REMOVE_MEASURE'),
		UPDATE_MEASURE_DATE_OPTIONS: type('[tools] UPDATE_MEASURE_DATA_OPTIONS'),
		UPDATE_MEASURE_LABEL: type('[tools] UPDATE_MEASURE_LABEL')
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

export class StartMouseShadow implements Action, ILogMessage {
	type = ToolsActionsTypes.START_MOUSE_SHADOW;

	constructor(public payload?: { updateTools?: boolean, fromUser?: boolean }) {
		// code...
	}

	logMessage() {
		return `Enabling shadow mouse`;
	}
}

export class SetAnnotationMode implements Action, ILogMessage {
	type = ToolsActionsTypes.STORE.SET_ANNOTATION_MODE;

	constructor(public payload: { annotationMode: AnnotationMode, mapId?: string }) {

	}

	logMessage() {
		return this.payload && this.payload.annotationMode && `Setting annotation mode = ${ this.payload.annotationMode }`;
	}
}

export class StopMouseShadow implements Action, ILogMessage {
	type = ToolsActionsTypes.STOP_MOUSE_SHADOW;

	constructor(public payload?: { updateTools?: boolean, fromUser?: boolean }) {
		// code...
	}

	logMessage() {
		return `Disabling shadow mouse`;
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

export class SetMapSearchBox implements Action {
	type = ToolsActionsTypes.SET_MAP_SEARCH_BOX;

	constructor(public payload: boolean) {
	};
}

export class SetPinLocationModeAction implements Action {
	type = ToolsActionsTypes.SET_PIN_LOCATION_MODE;

	constructor(public payload: boolean) {
	};
}

export class GoToAction implements Action, ILogMessage {
	type = ToolsActionsTypes.GO_TO;

	constructor(public payload: number[], public mapId?: string) {
	};

	logMessage() {
		return `Go to location ${this.payload}`
	}
}

export class GoToInputChangeAction implements Action {
	type = ToolsActionsTypes.GO_TO_INPUT_CHANGED;

	constructor(public payload: any[]) {
	}
}




export class SetMapGeoEnabledModeToolsActionStore implements Action {
	type = ToolsActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED;

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

export class UpdateMeasureDataOptionsAction implements Action, ILogMessage {
	type = ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATE_OPTIONS;

	constructor(public payload: {
		mapId: string,
		options: Partial<IMeasureDataOptions>,
		fromUI?: boolean
	}) {
	}

	logMessage() {
		return this.payload.fromUI && `Updating measure tool options: ${JSON.stringify(this.payload.options)}`
	}
}

export class UpdateMeasureLabelAction implements Action, ILogMessage {
	type = ToolsActionsTypes.MEASURES.UPDATE_MEASURE_LABEL;

	constructor(public payload: {
		mapId: string,
		labelEntity: IVisualizerEntity
	}) {
	}

	logMessage() {
		return `Updating measure label`
	}
}

export class AddMeasureAction implements Action, ILogMessage {
	type = ToolsActionsTypes.MEASURES.ADD_MEASURE;

	constructor(public payload: {
		mapId: string,
		measure: IVisualizerEntity
	}) {
	}

	logMessage() {
		return `Adding one measure to map`
	}
}

export class RemoveMeasureAction implements Action, ILogMessage {
	type = ToolsActionsTypes.MEASURES.REMOVE_MEASURE;

	constructor(public payload: {
		mapId: string;
		measureId?: string;
	}) {
	}

	logMessage() {
		return `Removing ${this.payload.measureId ? 'one measure' : 'all measures'} from map`
	}
}

export class AnnotationSetProperties implements Action, ILogMessage {
	type = ToolsActionsTypes.ANNOTATION_SET_PROPERTIES;

	constructor(public payload: Partial<IVisualizerStyle>) {

	}

	logMessage() {
		return `Setting annotation properties: ${JSON.stringify(this.payload)}`
	}
}

export class SetSubMenu implements Action, ILogMessage {
	type = ToolsActionsTypes.SET_SUB_MENU;

	constructor(public payload: SubMenuEnum) {

	}

	logMessage() {
		return this.payload && `Opening sub menu: ${SubMenuEnum[this.payload]}`
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
	| SetMapGeoEnabledModeToolsActionStore
	| SetAnnotationMode
	| SetSubMenu
	| ClearActiveInteractionsAction
	| SetMapSearchBox;
