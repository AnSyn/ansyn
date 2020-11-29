import { Action } from '@ngrx/store';
import { ILayer, LayerType } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from '../reducers/layers-modal';
import { ILogMessage } from '../../../core/models/logger.model';

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
	SHOW_ALL_LAYERS = '[Layers] Show all layers',
	LOG_EXPORT_LAYER = 'LOG_EXPORT_LAYER',
	LOG_IMPORT_LAYER = 'LOG_IMPORT_LAYER',
	LOG_RENAME_LAYER = 'LOG_RENAME_LAYER',
	LOG_ADD_FEATURE_TO_LAYER = 'LOG_ADD_FEATURE_TO_LAYER'
}

export type LayersActions =
	| BeginLayerCollectionLoadAction
	| LayerCollectionLoadedAction
	| ErrorLoadingLayersAction
	| UpdateSelectedLayersIds
	| SetLayerSelection
	| SelectOnlyLayer
	| AddLayer
	| UpdateLayer
	| SetLayersModal
	| CloseLayersModal;

export class BeginLayerCollectionLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD;

	constructor(public payload: { caseId: string }) {
	}
}

export class LayerCollectionLoadedAction implements Action, ILogMessage {
	type = LayersActionTypes.LAYER_COLLECTION_LOADED;

	constructor(public payload: ILayer[]) {
	}

	logMessage() {
		return `${this.payload.length} data layers loaded from backend`;
	}
}

export class UpdateSelectedLayersIds implements Action {
	type = LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS;

	constructor(public payload: string[]) {
	}
}

export class ErrorLoadingLayersAction implements Action {
	type = LayersActionTypes.ERROR_LOADING_LAYERS;

	constructor(public payload: string) {
	}
}

export class SetLayerSelection implements Action, ILogMessage {
	readonly type = LayersActionTypes.SET_LAYER_SELECTION;

	constructor(public payload: { id: string, value: boolean, layer?: ILayer }) {
	}

	logMessage() {
		return `${this.payload.value ? 'Un-' : ''}Hiding ${this.payload.layer ? this.payload.layer.type : 'data'} layer ${this.payload.layer ? this.payload.layer.name : ''}`
	}
}

export class SelectOnlyLayer implements Action {
	readonly type = LayersActionTypes.SELECT_ONLY;

	constructor(public payload: string) {
	}
}

export class AddLayer implements Action, ILogMessage {
	type = LayersActionTypes.ADD_LAYER;

	constructor(public payload: ILayer) {
	}

	logMessage() {
		return `Adding ${this.payload.type} data layer ${this.payload.name}` + (this.payload.data.features ? ` with ${this.payload.data.features.length} features` : ``);
	}
}

export class AddLayerOnBackendFailedAction extends AddLayer {
	readonly type = LayersActionTypes.ADD_LAYER_ON_BACKEND_FAILED_ACTION;

	constructor(public payload: ILayer, error: any) {
		super(payload)
	}

	logMessage() {
		return `Failed adding ${this.payload.type} data layer ${this.payload.name} to backend`
	}
}

export class AddLayerOnBackendSuccessAction implements Action {
	readonly type = LayersActionTypes.ADD_LAYER_ON_BACKEND_SUCCESS_ACTION;

	constructor(public payload: string) {
	}
}

export class UpdateLayer implements Action {
	type = LayersActionTypes.UPDATE_LAYER;

	constructor(public payload: Partial<ILayer>) {
	}
}

export class UpdateLayerOnBackendFailedAction extends UpdateLayer {
	readonly type = LayersActionTypes.UPDATE_LAYER_ON_BACKEND_FAILED_ACTION;

	constructor(public payload: ILayer, error: any) {
		super(payload)
	}

	logMessage() {
		return `Failed saving ${this.payload.type} data layer ${this.payload.name} to backend`
	}
}

export class UpdateLayerOnBackendSuccessAction implements Action {
	readonly type = LayersActionTypes.UPDATE_LAYER_ON_BACKEND_SUCCESS_ACTION;

	constructor(public payload: string) {
	}
}

export class RemoveLayer implements Action, ILogMessage {
	type = LayersActionTypes.REMOVE_LAYER;

	constructor(public payload: string) {

	}

	logMessage() {
		return `Removing data layer`
	}
}

export class RemoveLayerOnBackendFailedAction extends RemoveLayer {
	readonly type = LayersActionTypes.REMOVE_LAYER_ON_BACKEND_FAILED_ACTION;

	constructor(public payload: string, error: any) {
		super(payload);
	}

	logMessage() {
		return `Failed removing data layer from backend`
	}
}

export class RemoveLayerOnBackendSuccessAction implements Action {
	readonly type = LayersActionTypes.REMOVE_LAYER_ON_BACKEND_SUCCESS_ACTION;

	constructor(public payload: string) {
	}

	logMessage() {
		return `Removed data layer from backend`
	}
}

export class RemoveCaseLayersFromBackendAction implements Action {
	type = LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_ACTION;

	constructor(public caseId: string) {
	}
}

export class RemoveCaseLayersFromBackendSuccessAction extends RemoveCaseLayersFromBackendAction {
	readonly type = LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_SUCCESS_ACTION;
}

/**
 * @unused
 */
export class RemoveCaseLayersFromBackendFailedAction extends RemoveCaseLayersFromBackendAction {
	readonly type = LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_FAILED_ACTION;

	constructor(public caseId: string, error: any) {
		super(caseId);
	}
}

export class SetActiveAnnotationLayer implements Action, ILogMessage {
	type = LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER;

	constructor(public payload: string) {

	}

	logMessage() {
		return `Changed active annotation layer`
	}
}

export class SetLayersModal implements Action {
	type = LayersActionTypes.SET_MODAL;

	constructor(public payload: ILayerModal) {

	}
}

export class CloseLayersModal extends SetLayersModal {
	constructor() {
		super({ type: SelectedModalEnum.none, layer: null });
	}
}

export class ShowAllLayers implements Action {
	type = LayersActionTypes.SHOW_ALL_LAYERS;

	constructor(public payload: LayerType) {

	}
}

export class LogExportLayer implements Action, ILogMessage {
	type = LayersActionTypes.LOG_EXPORT_LAYER;

	constructor(public payload: { layer: ILayer, format: string }) {

	}

	logMessage() {
		return `Opening popup to save ${this.payload.layer.type} layer ${this.payload.layer.name} as ${this.payload.format} file`
	}
}

export class LogImportLayer implements Action, ILogMessage {
	type = LayersActionTypes.LOG_IMPORT_LAYER;

	constructor(public payload: { fileName: string }) {

	}

	logMessage() {
		return `Importing data layer from file ${this.payload.fileName}`
	}
}

export class LogRenameLayer implements Action, ILogMessage {
	type = LayersActionTypes.LOG_RENAME_LAYER;

	constructor(public payload: { layer: ILayer, name: string }) {

	}

	logMessage() {
		return `Renaming ${this.payload.layer.type} layer ${this.payload.layer.name} to ${this.payload.name}`
	}
}

export class LogAddFeatureToLayer implements Action, ILogMessage {
	type = LayersActionTypes.LOG_ADD_FEATURE_TO_LAYER;

	constructor(public payload: { layerName: string }) {

	}

	logMessage() {
		return `Adding feature to annotation layer ${this.payload.layerName}`
	}
}
