import { createAction, props } from '@ngrx/store';
import { ILayer, LayerType } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from '../reducers/layers-modal';

export enum LayersActionTypes {
	BEGIN_LAYER_COLLECTION_LOAD = '[Layers] Begin layer collection load',
	LAYER_COLLECTION_LOADED = '[Layers] Layer collection loaded',
	ERROR_LOADING_LAYERS = '[Layers] Error loading layers',
	UPDATE_SELECTED_LAYERS_IDS = '[Layers] Update selected layers ids',
	SET_LAYER_SELECTION = '[Layers] Set layer selection',
	SELECT_ONLY = '[Layers] Select only',
	ADD_LAYER = '[Layers] Add layer',
	ADD_LAYER_ON_BACKEND_FAILED_ACTION = '[Layers] Add layer to backend failed',
	ADD_LAYER_ON_BACKEND_SUCCESS_ACTION = '[Layers] Add layer to backend success',
	UPDATE_LAYER = '[Layers] Update layer',
	UPDATE_LAYER_ON_BACKEND_FAILED_ACTION = '[Layers] Update layer to backend failed',
	UPDATE_LAYER_ON_BACKEND_SUCCESS_ACTION = '[Layers] Update layer to backend success',
	REMOVE_LAYER = '[Layers] Remove layer',
	REMOVE_LAYER_ON_BACKEND_FAILED_ACTION = '[Layers] Remove layer to backend failed',
	REMOVE_LAYER_ON_BACKEND_SUCCESS_ACTION = '[Layers] Remove layer to backend success',
	REMOVE_CASE_LAYERS_FROM_BACKEND_ACTION = '[Layers] Remove case layers from backend',
	REMOVE_CASE_LAYERS_FROM_BACKEND_SUCCESS_ACTION = '[Layers] Remove case layers from backend success',
	REMOVE_CASE_LAYERS_FROM_BACKEND_FAILED_ACTION = '[Layers] Remove case layers from backend failed',
	SET_ACTIVE_ANNOTATION_LAYER = '[Layers] Set active annotation layer',
	SET_MODAL = '[Layers] Set modal value',
	CLOSE_MODAL = '[Layers] Close modal value',
	SHOW_ALL_LAYERS = '[Layers] Show all layers'
}
export const BeginLayerCollectionLoadAction = createAction(
												LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD,
												props<{ caseId: string }>()
);

export const LayerCollectionLoadedAction = createAction(
											LayersActionTypes.LAYER_COLLECTION_LOADED,
											props<{payload: ILayer[]}>()
);

export const UpdateSelectedLayersIds = createAction(
										LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS,
										props<{payload: string[]}>()
);

export const ErrorLoadingLayersAction = createAction(
											LayersActionTypes.ERROR_LOADING_LAYERS,
											props<{payload: string}>()
);

export const SetLayerSelection = createAction(
									LayersActionTypes.SET_LAYER_SELECTION,
									props<{ id: string, value: boolean }>()
);

export const SelectOnlyLayer = createAction(
								LayersActionTypes.SELECT_ONLY,
								props<{payload: string}>()
);

export const AddLayer = createAction(
							LayersActionTypes.ADD_LAYER,
							props<{payload: ILayer}>()
);

export const AddLayerOnBackendFailedAction = createAction(
												LayersActionTypes.ADD_LAYER_ON_BACKEND_FAILED_ACTION,
												props<{payload: ILayer, error: any}>()
);

export const AddLayerOnBackendSuccessAction = createAction(
												LayersActionTypes.ADD_LAYER_ON_BACKEND_SUCCESS_ACTION,
												props<{payload: string}>()
);

export const UpdateLayer = createAction(
								LayersActionTypes.UPDATE_LAYER,
								props<{payload: ILayer}>()
);

export const UpdateLayerOnBackendFailedAction = createAction(
													LayersActionTypes.UPDATE_LAYER_ON_BACKEND_FAILED_ACTION,
													props<{payload: ILayer, error: any}>()
);

export const UpdateLayerOnBackendSuccessAction = createAction(
													LayersActionTypes.UPDATE_LAYER_ON_BACKEND_SUCCESS_ACTION,
													props<{payload: string}>()
);

export const RemoveLayer = createAction(
								LayersActionTypes.REMOVE_LAYER,
								props<{payload: string}>()
);

export const RemoveLayerOnBackendFailedAction = createAction(
													LayersActionTypes.REMOVE_LAYER_ON_BACKEND_FAILED_ACTION,
													props<{payload: string, error: any}>()
);

export const RemoveLayerOnBackendSuccessAction = createAction(
													LayersActionTypes.REMOVE_LAYER_ON_BACKEND_SUCCESS_ACTION,
													props<{payload: string}>()
);

export const RemoveCaseLayersFromBackendAction = createAction(
													LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_ACTION,
													props<{caseId: string}>()
);

export const RemoveCaseLayersFromBackendSuccessAction = createAction(
															LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_SUCCESS_ACTION,
															props<{caseId: string}>()
);

export const RemoveCaseLayersFromBackendFailedAction = createAction(
														LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_FAILED_ACTION,
														props<{caseId: string, error: any}>()
);


export const SetActiveAnnotationLayer = createAction(
											LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER,
											props<{payload: string}>()
);

export const SetLayersModal = createAction(
								LayersActionTypes.SET_MODAL,
								props<{payload: ILayerModal}>()
);

export const CloseLayersModal = createAction(
								LayersActionTypes.CLOSE_MODAL,
								props<{payload: ILayerModal}>()
);


export const ShowAllLayers = createAction(
								LayersActionTypes.SHOW_ALL_LAYERS,
								props<{payload: LayerType}>()
);
