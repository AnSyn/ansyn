import {
	AddMeasureAction,
	CreateMeasureDataAction, RemoveMeasureAction, RemoveMeasureDataAction,
	SetActiveCenter, SetActiveOverlaysFootprintModeAction,
	SetAnnotationMode,
	SetMapGeoEnabledModeToolsActionStore,
	SetMeasureDistanceToolState,
	SetPinLocationModeAction, SetSubMenu,
	StartMouseShadow,
	StopMouseShadow,
	ToolsActions,
	ToolsActionsTypes, UpdateMeasureDataOptionsAction,
	UpdateToolsFlags
} from '../actions/tools.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IVisualizerEntity, IVisualizerStyle } from '@ansyn/imagery';
import { OverlayDisplayMode } from '../overlays-display-mode/overlays-display-mode.component';
import { AnnotationMode } from '@ansyn/ol';
import { IMeasureData, IMeasureDataOptions } from '../models/measure-data';

export enum toolsFlags {
	geoRegisteredOptionsEnabled = 'geoRegisteredOptionsEnabled',
	shadowMouse = 'shadowMouse',
	shadowMouseDisabled = 'shadowMouseDisabled',
	shadowMouseActiveForManyScreens = 'shadowMouseActiveForManyScreens',
	forceShadowMouse = 'forceShadowMouse',
	pinLocation = 'pinLocation',
	isMeasureToolActive = 'isMeasureToolActive'
}

export enum SubMenuEnum { goTo, overlays, annotations }

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
	activeAnnotationLayer: null,
	mapsMeasures: new Map<string, IMeasureData>()
};

export const toolsFeatureKey = 'tools';
export const toolsStateSelector: MemoizedSelector<any, IToolsState> = createFeatureSelector<IToolsState>(toolsFeatureKey);

export function ToolsReducer(state = toolsInitialState, action: ToolsActions): IToolsState {
	let tmpMap: Map<toolsFlags, boolean>;
	switch (action.type) {
		case ToolsActionsTypes.STORE.SET_ANNOTATION_MODE:
			const annotationMode = action.payload ? (<SetAnnotationMode>action).payload.annotationMode : null;
			return { ...state, annotationMode: annotationMode };

		case ToolsActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED:
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.geoRegisteredOptionsEnabled, (<SetMapGeoEnabledModeToolsActionStore>action).payload);
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
			(<UpdateToolsFlags>action).payload.forEach(({ key, value }) => {
				flags.set(key, value);
			});
			return { ...state, flags };
		}

		case ToolsActionsTypes.SET_ACTIVE_CENTER:
			return { ...state, activeCenter: (<SetActiveCenter>action).payload };

		case ToolsActionsTypes.SET_PIN_LOCATION_MODE:
			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.pinLocation, (<SetPinLocationModeAction>action).payload);
			return { ...state, flags: tmpMap };

		case ToolsActionsTypes.MEASURES.SET_MEASURE_TOOL_STATE:

			tmpMap = new Map(state.flags);
			tmpMap.set(toolsFlags.isMeasureToolActive, (<SetMeasureDistanceToolState>action).payload);
			const mapsMeasures = new Map(state.mapsMeasures);
			Array.from(mapsMeasures.keys()).forEach((key: string) => {
				mapsMeasures.set(key, createNewMeasureData());
			});
			return { ...state, flags: tmpMap, mapsMeasures };

		case ToolsActionsTypes.MEASURES.CREATE_MEASURE_DATA: {

			const mapsMeasures = new Map(state.mapsMeasures);
			if (!mapsMeasures.has((<CreateMeasureDataAction><unknown>action).payload.mapId)) {
				mapsMeasures.set((<CreateMeasureDataAction><unknown>action).payload.mapId, createNewMeasureData());
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.MEASURES.REMOVE_MEASURE_DATA: {

			const mapsMeasures = new Map(state.mapsMeasures);
			if (mapsMeasures.has((<RemoveMeasureDataAction><unknown>action).payload.mapId)) {
				mapsMeasures.delete((<RemoveMeasureDataAction><unknown>action).payload.mapId);
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATE_OPTIONS: {
			const newOptions: Partial<IMeasureDataOptions> = (action as unknown as UpdateMeasureDataOptionsAction).payload.options;
			const mapsMeasures = new Map(state.mapsMeasures);
			const mapMeasure = mapsMeasures.get((action as unknown as UpdateMeasureDataOptionsAction).payload.mapId);
			if (mapMeasure) {
				mapsMeasures.set((action as unknown as UpdateMeasureDataOptionsAction).payload.mapId, {...mapMeasure, ...newOptions});
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.MEASURES.ADD_MEASURE: {
			const { mapId, measure } = (action as unknown as AddMeasureAction).payload;
			const mapsMeasures = new Map(state.mapsMeasures);
			const mapMeasure = mapsMeasures.get(mapId);
			if (mapMeasure) {
				mapsMeasures.set(mapId, {...mapMeasure, meausres: [...mapMeasure.meausres, measure]})
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.MEASURES.REMOVE_MEASURE: {
			const { mapId, measureId } = (action as unknown as RemoveMeasureAction).payload;
			const mapsMeasures = new Map(state.mapsMeasures);
			if (mapsMeasures.has(mapId)) {
				const mapMeasure = mapsMeasures.get(mapId);
				const meausres = measureId ? mapMeasure.meausres.filter( measure => measure.id !== measureId) : [];
				mapsMeasures.set(mapId, {...mapMeasure, meausres})
			}
			return { ...state, mapsMeasures };
		}

		case ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE:
			return { ...state, activeOverlaysFootprintMode: (<SetActiveOverlaysFootprintModeAction>action).payload };

		case ToolsActionsTypes.ANNOTATION_SET_PROPERTIES:
			return { ...state, annotationProperties: { ...state.annotationProperties, ...action.payload } };

		case ToolsActionsTypes.SET_SUB_MENU:
			return { ...state, subMenu: (<SetSubMenu>action).payload };

		default:
			return state;

	}
}

export const selectSubMenu = createSelector(toolsStateSelector, (tools: IToolsState) => tools.subMenu);
export const selectAnnotationMode = createSelector(toolsStateSelector, (tools: IToolsState) => tools.annotationMode);
export const selectAnnotationProperties = createSelector(toolsStateSelector, (tools: IToolsState) => tools.annotationProperties);
export const selectToolFlags = createSelector(toolsStateSelector, (tools: IToolsState) => tools.flags);
export const selectToolFlag = (flag: toolsFlags) => createSelector(selectToolFlags, (flags: Map<toolsFlags, boolean>) => flags.get(flag));
export const selectIsMeasureToolActive = createSelector(selectToolFlags, (_toolsFlags) => _toolsFlags.get(toolsFlags.isMeasureToolActive));
export const selectGeoRegisteredOptionsEnabled = createSelector(selectToolFlags, (_toolsFlags) => _toolsFlags.get(toolsFlags.geoRegisteredOptionsEnabled));
// export const selectOverlayFootprintMode = createSelector(toolsStateSelector, (tools: IToolsState) => tools.activeOverlaysFootprintMode);
export const selectMeasureDataByMapId = (mapId: string) => createSelector(toolsStateSelector, (tools: IToolsState) => {
	return tools && tools.mapsMeasures && tools.mapsMeasures.get(mapId);
});
