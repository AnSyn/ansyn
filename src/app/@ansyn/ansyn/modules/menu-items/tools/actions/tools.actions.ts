import { Action, createAction, props } from '@ngrx/store';
import { IVisualizerEntity, IVisualizerStyle } from '@ansyn/imagery';
import { SubMenuEnum, toolsFlags } from '../reducers/tools.reducer';
import { type } from '../../../core/utils/type';
import { OverlayDisplayMode } from '../overlays-display-mode/overlays-display-mode.component';
import { ImageManualProcessArgs, IOverlaysManualProcessArgs } from '../../cases/models/case.model';
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
	SET_AUTO_IMAGE_PROCESSING: type('SET_AUTO_IMAGE_PROCESSING'),
	SET_MANUAL_IMAGE_PROCESSING: type('SET_MANUAL_IMAGE_PROCESSING'),
	SET_AUTO_IMAGE_PROCESSING_SUCCESS: type('SET_AUTO_IMAGE_PROCESSING_SUCCESS'),
	ENABLE_IMAGE_PROCESSING: type('ENABLE_IMAGE_PROCESSING'),
	DISABLE_IMAGE_PROCESSING: type('DISABLE_IMAGE_PROCESSING'),
	MAP_GEO_ENABLED_MODE_CHANGED: type('MAP_GEO_ENABLED_MODE_CHANGED'),
	ANNOTATION_SET_PROPERTIES: type('ANNOTATION_SET_PROPERTIES'),
	UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS: type('UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS'),
	SET_SUB_MENU: type('SET_SUB_MENU'),
	MEASURES: {
		SET_MEASURE_TOOL_STATE: type('[tools] SET_MEASURE_TOOL_STATE'),
		CREATE_MEASURE_DATA: type('[tools] CREATE_MEASURE_DATA'),
		REMOVE_MEASURE_DATA: type('[tools] REMOVE_MEASURE_DATA'),
		UPDATE_MEASURE_DATA: type('[tools] UPDATE_MEASURE_DATA')
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

export const UpdateOverlaysManualProcessArgs = createAction(
												ToolsActionsTypes.UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS,
												props<{ override?: boolean, data: IOverlaysManualProcessArgs }>()
);

export const StartMouseShadow = createAction(
									ToolsActionsTypes.START_MOUSE_SHADOW,
									props<{ updateTools?: boolean, fromUser?: boolean }>()
);

export const SetAnnotationMode = createAction(
									ToolsActionsTypes.STORE.SET_ANNOTATION_MODE,
									props<{ annotationMode: AnnotationMode, mapId?: string }>()
);

export const StopMouseShadow = createAction(
								ToolsActionsTypes.STOP_MOUSE_SHADOW,
								props<{ updateTools?: boolean, fromUser?: boolean }>()
);

export const UpdateToolsFlags = createAction(
									ToolsActionsTypes.UPDATE_TOOLS_FLAGS,
									props<{payload: { key: toolsFlags, value: boolean }[]}>()
);

export const PullActiveCenter = createAction(
									ToolsActionsTypes.PULL_ACTIVE_CENTER,
									props<{payload: any}>()
);

export const SetActiveCenter = createAction(
								ToolsActionsTypes.SET_ACTIVE_CENTER,
								props<{payload: number[]}>()
);

export const SetPinLocationModeAction = createAction(
											ToolsActionsTypes.SET_PIN_LOCATION_MODE,
											props<{payload: boolean}>()
);

export const GoToAction = createAction(
							ToolsActionsTypes.GO_TO,
							props<{payload: number[]}>()
);

export const GoToInputChangeAction = createAction(
										ToolsActionsTypes.GO_TO_INPUT_CHANGED,
										props<{payload: any[]}>()
);

export const ShowOverlaysFootprintAction = createAction(
											ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT,
											props<{payload: OverlayDisplayMode}>()
);

export const SetActiveOverlaysFootprintModeAction = createAction(
														ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE,
														props<{payload: OverlayDisplayMode}>()
);

export const SetMapGeoEnabledModeToolsActionStore = createAction(
														ToolsActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED,
														props<{payload: boolean}>()
);

export const SetAutoImageProcessing = createAction(
										ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING,
										props<{payload?: any}>()
);

export const SetAutoImageProcessingSuccess = createAction(
												ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS,
												props<{payload: boolean}>()
);

export const SetMeasureDistanceToolState = createAction(
											ToolsActionsTypes.MEASURES.SET_MEASURE_TOOL_STATE,
											props<{payload: boolean}>()
);

export const CreateMeasureDataAction = createAction(
										ToolsActionsTypes.MEASURES.CREATE_MEASURE_DATA,
										props<{ mapId: string }>()
);

export const RemoveMeasureDataAction = createAction(
										ToolsActionsTypes.MEASURES.REMOVE_MEASURE_DATA,
										props<{ mapId: string }>()
);

export const UpdateMeasureDataAction = createAction(
										ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATA,
										props<{
											mapId: string, measureData: {
												meausres?: IVisualizerEntity[],
												isLayerShowed?: boolean,
												isToolActive?: boolean,
												isRemoveMeasureModeActive?: boolean
											}
										}>()
);

export const DisableImageProcessing = createAction(
										ToolsActionsTypes.DISABLE_IMAGE_PROCESSING,
										props<{payload?: any}>()
);

export const EnableImageProcessing = createAction(
										ToolsActionsTypes.ENABLE_IMAGE_PROCESSING,
										props<{payload?: any}>()
);

export const SetManualImageProcessing = createAction(
											ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING,
											props<ImageManualProcessArgs>()
);

export const AnnotationSetProperties = createAction(
										ToolsActionsTypes.ANNOTATION_SET_PROPERTIES,
										props<Partial<IVisualizerStyle>>()
);

export const SetSubMenu = createAction(
							ToolsActionsTypes.SET_SUB_MENU,
							props<{payload: SubMenuEnum}>()
);


export const ClearActiveInteractionsAction = createAction(
												ToolsActionsTypes.CLEAR_ACTIVE_TOOLS,
												props<{ skipClearFor: Array<any> }>()
);

export const AnnotationRemoveFeature = createAction(
										ToolsActionsTypes.ANNOTATION_REMOVE_FEATURE,
										props<{payload: string}>()
);

export const AnnotationUpdateFeature = createAction(
										ToolsActionsTypes.ANNOTATION_UPDATE_FEATURE,
										props<IUpdateFeatureEvent>()
);

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
	| SetSubMenu
	| ClearActiveInteractionsAction;
