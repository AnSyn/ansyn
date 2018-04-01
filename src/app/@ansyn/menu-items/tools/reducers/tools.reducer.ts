import { ToolsActions, ToolsActionsTypes } from '../actions/tools.actions';
import { ImageManualProcessArgs, OverlayDisplayMode } from '@ansyn/core';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { AnnotationMode } from '@ansyn/core/models/visualizers/annotations.model';

export enum toolsFlags {
	annotations = 'annotations',
	geoRegisteredOptionsEnabled = 'geoRegisteredOptionsEnabled',
	shadowMouse = 'shadowMouse',
	shadowMouseDisabled = 'shadowMouseDisabled',
	pinLocation = 'pinLocation',
	autoImageProcessing= 'autoImageProcessing',
	imageProcessingDisabled = 'imageProcessingDisabled',
	isMeasureToolActive = 'isMeasureToolActive'
}

export interface AnnotationProperties {
	strokeWidth?: number;
	strokeColor?: string;
	fillColor?: string;
}

export interface IToolsState {
	flags: Map<toolsFlags, boolean>;
	activeCenter: number[];
	activeOverlaysFootprintMode?: OverlayDisplayMode;
	gotoExpand: boolean;
	annotationMode: AnnotationMode;
	annotationProperties: AnnotationProperties
	manualImageProcessingParams: ImageManualProcessArgs;
	imageProcessingHash: { [key: string]: ImageManualProcessArgs }
}

export const toolsInitialState: IToolsState = {
	flags: new Map<toolsFlags, boolean>([
		[toolsFlags.geoRegisteredOptionsEnabled, true],
	]),
	activeCenter: [0, 0],
	gotoExpand: false,
	annotationMode: undefined,
	annotationProperties: {
		strokeWidth: 1,
		strokeColor: '#27b2cf',
		fillColor: '#ffffff'
	},
	manualImageProcessingParams: undefined,
	imageProcessingHash: {}
};

export const toolsFeatureKey = 'tools';
export const toolsStateSelector: MemoizedSelector<any, IToolsState> = createFeatureSelector<IToolsState>(toolsFeatureKey);

export function ToolsReducer(state = toolsInitialState, action: ToolsActions): IToolsState {
	let tmpMap: Map<toolsFlags, boolean>;
	switch (action.type) {

		case ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING_SUCCESS:
		{
			const {mapId, processingParams} = action.payload;
			return {
				...state,
				imageProcessingHash: {
					...state.imageProcessingHash,
					[mapId]: processingParams
				}
			}
		}


		case ToolsActionsTypes.STORE.SET_ANNOTATION_MODE:
			return { ...state, annotationMode: <AnnotationMode> action.payload };

		case ToolsActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED:
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.geoRegisteredOptionsEnabled, action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.START_MOUSE_SHADOW:
			if (action.payload && action.payload['updateTools'] === false) {
				return state;	// skip when action.payload.updateTools is false
			}
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.shadowMouse, true);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.STOP_MOUSE_SHADOW:
			if (action.payload && action.payload['updateTools'] === false) {
				return state;	// skip when action.payload.updateTools is false
			}
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.shadowMouse, false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.DISABLE_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.shadowMouseDisabled, true);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.ENABLE_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.shadowMouseDisabled, false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.SET_ACTIVE_CENTER:
			return { ...state, activeCenter: action.payload };

		case ToolsActionsTypes.SET_PIN_LOCATION_MODE:
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.pinLocation, action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.GO_TO:
			return state;

		case ToolsActionsTypes.GO_TO_EXPAND:
			return { ...state, gotoExpand: action.payload };

		case ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.autoImageProcessing, action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.SET_MEASURE_TOOL_STATE:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.isMeasureToolActive, action.payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.ENABLE_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.imageProcessingDisabled, false);
			tmpMap.set(toolsFlags.autoImageProcessing, false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.DISABLE_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.imageProcessingDisabled, true);
			tmpMap.set(toolsFlags.autoImageProcessing, false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.FLAGS.ANNOTATION_CLOSE:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.annotations, false);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.FLAGS.ANNOTATION_OPEN:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.annotations, true);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING:
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.autoImageProcessing, false);
			return { ...state, flags: tmpMap, manualImageProcessingParams: action.payload.processingParams };

		case ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE:
			return { ...state, activeOverlaysFootprintMode: action.payload };

		case ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING_ARGUMENTS:
			return { ...state, manualImageProcessingParams: action.payload.processingParams };

		case ToolsActionsTypes.ANNOTATION_SET_PROPERTIES:
			return { ...state, annotationProperties: { ...state.annotationProperties, ...action.payload } };

		default:
			return state;

	}
}

