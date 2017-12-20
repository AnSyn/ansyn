import { ToolsActions, ToolsActionsTypes } from '../actions/tools.actions';
import { OverlayDisplayMode } from '@ansyn/core';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';

export interface IToolsState {
	flags: Map<string, boolean>;
	activeCenter: number[];
	activeOverlaysFootprintMode?: OverlayDisplayMode;
	gotoExpand: boolean;
	annotationMode: string;
	manualImageProcessingParams: Object;
}

export const toolsInitialState: IToolsState = {
	flags: new Map<string, boolean>([
		['geoRegisteredOptionsEnabled', true],
		['annotations', true]
	]),
	activeCenter: [0, 0],
	gotoExpand: false,
	annotationMode: undefined,
	manualImageProcessingParams: undefined
};

export const toolsFeatureKey = 'tools';
export const toolsStateSelector: MemoizedSelector<any, IToolsState> = createFeatureSelector<IToolsState>(toolsFeatureKey);

export function ToolsReducer(state = toolsInitialState, action: ToolsActions): IToolsState {
	let tmpMap: Map<string, boolean>;
	switch (action.type) {
		case ToolsActionsTypes.STORE.SET_ANNOTATION_MODE:
			return { ...state, annotationMode: action.payload };

		case ToolsActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED:

			tmpMap = new Map(state.flags);
			tmpMap.set('geoRegisteredOptionsEnabled', action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.START_MOUSE_SHADOW:
			if (action.payload && action.payload['updateTools'] === false) {
				return state;	// skip when action.payload.updateTools is false
			}
			tmpMap = new Map(state.flags);
			tmpMap.set('shadowMouse', true);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.STOP_MOUSE_SHADOW:
			if (action.payload && action.payload['updateTools'] === false) {
				return state;	// skip when action.payload.updateTools is false
			}
			tmpMap = new Map(state.flags);
			tmpMap.set('shadowMouse', false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.DISABLE_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set('shadowMouseDisabled', true);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.ENABLE_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set('shadowMouseDisabled', false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.SET_ACTIVE_CENTER:
			return { ...state, activeCenter: action.payload };

		case ToolsActionsTypes.SET_PIN_LOCATION_MODE:
			tmpMap = new Map(state.flags);
			tmpMap.set('pinLocation', action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.GO_TO:
			return state;

		case ToolsActionsTypes.GO_TO_EXPAND:
			return { ...state, gotoExpand: action.payload };

		case ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS:

			tmpMap = new Map(state.flags);
			tmpMap.set('autoImageProcessing', action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.ENABLE_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set('imageProcessingDisabled', false);
			tmpMap.set('autoImageProcessing', false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.DISABLE_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set('imageProcessingDisabled', true);
			tmpMap.set('autoImageProcessing', false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.FLAGS.ANNOTATION_CLOSE:

			tmpMap = new Map(state.flags);
			tmpMap.set('annotations', false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.FLAGS.ANNOTATION_OPEN:

			tmpMap = new Map(state.flags);
			tmpMap.set('annotations', true);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING:
			tmpMap = new Map(state.flags);
			tmpMap.set('autoImageProcessing', false);
			return { ...state, flags: tmpMap, manualImageProcessingParams: action.payload.processingParams };

		case ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE:
			return { ...state, activeOverlaysFootprintMode: action.payload };

		case ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING_ARGUMENTS:
			return { ...state, manualImageProcessingParams: action.payload.processingParams };

		default:
			return state;

	}
}

