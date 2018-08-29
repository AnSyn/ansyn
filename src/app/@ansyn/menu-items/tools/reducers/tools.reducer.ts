import { ToolsActions, ToolsActionsTypes } from '../actions/tools.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { AnnotationMode } from '@ansyn/core/models/visualizers/annotations.model';
import { ImageManualProcessArgs, OverlayDisplayMode, IOverlaysManualProcessArgs } from '@ansyn/core/models/case.model';
import { FeatureCollection } from 'geojson';
import * as turf from '@turf/turf';
import { IVisualizerStateStyle } from '@ansyn/core/models/visualizers/visualizer-state';
import { IVisualizerStyle } from '@ansyn/core/models/visualizers/visualizer-style';

export enum toolsFlags {
	geoRegisteredOptionsEnabled = 'geoRegisteredOptionsEnabled',
	shadowMouse = 'shadowMouse',
	shadowMouseDisabled = 'shadowMouseDisabled',
	pinLocation = 'pinLocation',
	autoImageProcessing = 'autoImageProcessing',
	imageProcessingDisabled = 'imageProcessingDisabled',
	isMeasureToolActive = 'isMeasureToolActive'
}

export enum SubMenuEnum { goTo, manualImageProcessing, overlays, annotations }

export interface IToolsState {
	flags: Map<toolsFlags, boolean>;
	subMenu: SubMenuEnum;
	activeCenter: number[];
	activeOverlaysFootprintMode?: OverlayDisplayMode;
	annotationMode: AnnotationMode;
	annotationProperties: Partial<IVisualizerStyle>;
	manualImageProcessingParams: ImageManualProcessArgs;
	overlaysManualProcessArgs: IOverlaysManualProcessArgs;
	activeAnnotationLayer: string;
}

export const toolsInitialState: IToolsState = {
	flags: new Map<toolsFlags, boolean>([
		[toolsFlags.geoRegisteredOptionsEnabled, true]
	]),
	subMenu: undefined,
	activeCenter: [0, 0],
	annotationMode: undefined,
	annotationProperties: {
		'stroke-width': 1,
		'fill-opacity': 0.4,
		'stroke-opacity': 1,
		stroke: '#27b2cf',
		fill: '#ffffff'
	},
	manualImageProcessingParams: undefined,
	overlaysManualProcessArgs: {},
	activeAnnotationLayer: null
};

export const toolsFeatureKey = 'tools';
export const toolsStateSelector: MemoizedSelector<any, IToolsState> = createFeatureSelector<IToolsState>(toolsFeatureKey);

export function ToolsReducer(state = toolsInitialState, action: ToolsActions): IToolsState {
	let tmpMap: Map<toolsFlags, boolean>;
	switch (action.type) {
		case ToolsActionsTypes.UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS:
			if (action.payload.override) {
				return { ...state, overlaysManualProcessArgs: action.payload.data };
			}
			return { ...state, overlaysManualProcessArgs: { ...state.overlaysManualProcessArgs, ...action.payload.data } };

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

		case ToolsActionsTypes.UPDATE_TOOLS_FLAGS: {
			const flags = new Map(state.flags);
			action.payload.forEach(({ key, value }) => {
				flags.set(key, value);
			});
			return { ...state, flags };
		}

		case ToolsActionsTypes.SET_ACTIVE_CENTER:
			return { ...state, activeCenter: action.payload };

		case ToolsActionsTypes.SET_PIN_LOCATION_MODE:
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.pinLocation, action.payload);
			return { ...state, flags: tmpMap };

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

		case ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING:
			return { ...state, manualImageProcessingParams: action.payload };

		case ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE:
			return { ...state, activeOverlaysFootprintMode: action.payload };

		case ToolsActionsTypes.ANNOTATION_SET_PROPERTIES:
			return { ...state, annotationProperties: { ...state.annotationProperties, ...action.payload } };

		case ToolsActionsTypes.SET_SUB_MENU:
			return { ...state, subMenu: action.payload };

		default:
			return state;

	}
}

export const selectSubMenu = createSelector(toolsStateSelector, (tools: IToolsState) => tools.subMenu);
export const selectOverlaysManualProcessArgs = createSelector(toolsStateSelector, (tools: IToolsState) => tools.overlaysManualProcessArgs);
export const selectAnnotationMode = createSelector(toolsStateSelector, (tools: IToolsState) => tools.annotationMode);
export const selectAnnotationProperties = createSelector(toolsStateSelector, (tools: IToolsState) => tools.annotationProperties);
