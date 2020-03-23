import { StartMouseShadow, StopMouseShadow, ToolsActions, ToolsActionsTypes } from '../actions/tools.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IVisualizerEntity, IVisualizerStyle } from '@ansyn/imagery';
import { IImageManualProcessArgs, IOverlaysManualProcessArgs } from '../../cases/models/case.model';
import { OverlayDisplayMode } from '../overlays-display-mode/overlays-display-mode.component';
import { AnnotationMode } from '@ansyn/ol';

export enum toolsFlags {
	geoRegisteredOptionsEnabled = 'geoRegisteredOptionsEnabled',
	shadowMouse = 'shadowMouse',
	shadowMouseDisabled = 'shadowMouseDisabled',
	shadowMouseActiveForManyScreens = 'shadowMouseActiveForManyScreens',
	forceShadowMouse = 'forceShadowMouse',
	pinLocation = 'pinLocation',
	autoImageProcessing = 'autoImageProcessing',
	imageProcessingDisabled = 'imageProcessingDisabled',
	isMeasureToolActive = 'isMeasureToolActive'
}

export enum SubMenuEnum { goTo, manualImageProcessing, overlays, annotations }

export interface IMeasureData {
	meausres: IVisualizerEntity[];
	isLayerShowed: boolean;
	isToolActive: boolean;
	isRemoveMeasureModeActive: boolean;
}

export function createNewMeasureData(): IMeasureData {
	return {
		isLayerShowed: true,
		isToolActive: true,
		isRemoveMeasureModeActive: false,
		meausres: []
	}
}

export interface IToolsState {
	flags: Map<toolsFlags, boolean>;
	subMenu: SubMenuEnum;
	activeCenter: number[];
	activeOverlaysFootprintMode?: OverlayDisplayMode;
	annotationMode: AnnotationMode;
	annotationProperties: Partial<IVisualizerStyle>;
	manualImageProcessingParams: IImageManualProcessArgs;
	overlaysManualProcessArgs: IOverlaysManualProcessArgs;
	activeAnnotationLayer: string;
	mapsMeasures: Map<string, IMeasureData>;
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
		'stroke-dasharray': 0,
		stroke: '#27b2cf',
		fill: '#ffffff'
	},
	manualImageProcessingParams: undefined,
	overlaysManualProcessArgs: {},
	activeAnnotationLayer: null,
	mapsMeasures: new Map<string, IMeasureData>()
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
			return {
				...state,
				overlaysManualProcessArgs: { ...state.overlaysManualProcessArgs, ...action.payload.data }
			};

		case ToolsActionsTypes.STORE.SET_ANNOTATION_MODE:
			const annotationMode = action.payload ? action.payload.annotationMode : null;
			return { ...state, annotationMode: annotationMode };

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
			if (action.payload && (<StartMouseShadow>action).payload.fromUser) {
				tmpMap.set(toolsFlags.shadowMouseActiveForManyScreens, true);
			}
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.STOP_MOUSE_SHADOW:
			if (action.payload && action.payload['updateTools'] === false) {
				return state;	// skip when action.payload.updateTools is false
			}
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.shadowMouse, false);
			if (action.payload && (<StopMouseShadow>action).payload.fromUser) {
				tmpMap.set(toolsFlags.shadowMouseActiveForManyScreens, false);
				tmpMap.set(toolsFlags.forceShadowMouse, false);
			}
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

		case ToolsActionsTypes.MEASURES.SET_MEASURE_TOOL_STATE:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.isMeasureToolActive, action.payload);
			const mapsMeasures = new Map(state.mapsMeasures);
			Array.from(mapsMeasures.keys()).forEach((key: string) => {
				mapsMeasures.set(key, createNewMeasureData());
			});
			return { ...state, flags: tmpMap, mapsMeasures };

		case ToolsActionsTypes.MEASURES.CREATE_MEASURE_DATA: {

			const mapsMeasures = new Map(state.mapsMeasures);
			if (!mapsMeasures.has(action.payload.mapId)) {
				mapsMeasures.set(action.payload.mapId, createNewMeasureData());
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.MEASURES.REMOVE_MEASURE_DATA: {

			const mapsMeasures = new Map(state.mapsMeasures);
			if (mapsMeasures.has(action.payload.mapId)) {
				mapsMeasures.delete(action.payload.mapId);
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATA: {
			const payloadMeasureData: IMeasureData = action.payload.measureData;
			const mapsMeasures = new Map(state.mapsMeasures);
			if (mapsMeasures.has(action.payload.mapId)) {
				let data: IMeasureData = mapsMeasures.get(action.payload.mapId);
				data = { ...data, ...payloadMeasureData };
				mapsMeasures.set(action.payload.mapId, { ...data });
			}
			return { ...state, mapsMeasures };
		}

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
export const selectToolFlags = createSelector(toolsStateSelector, (tools: IToolsState) => tools.flags);
export const selectToolFlag = (flag: toolsFlags) => createSelector(selectToolFlags, (flags: Map<toolsFlags, boolean>) => flags.get(flag));
export const selectIsMeasureToolActive = createSelector(selectToolFlags, (_toolsFlags) => _toolsFlags.get(toolsFlags.isMeasureToolActive));
export const selectGeoRegisteredOptionsEnabled = createSelector(selectToolFlags, (_toolsFlags) => _toolsFlags.get(toolsFlags.geoRegisteredOptionsEnabled));
export const selectOverlayFootprintMode = createSelector(toolsStateSelector, (tools: IToolsState) => tools.activeOverlaysFootprintMode);
export const selectMeasureDataByMapId = (mapId: string) => createSelector(toolsStateSelector, (tools: IToolsState) => {
	return tools && tools.mapsMeasures && tools.mapsMeasures.get(mapId);
});
