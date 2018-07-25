import { Action } from '@ngrx/store';
import { ILayer } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from '../reducers/layers-modal';

export enum LayersActionTypes {
	BEGIN_LAYER_COLLECTION_LOAD = '[Layers] Begin layer collection load',
	LAYER_COLLECTION_LOADED = '[Layers] Layer collection loaded',
	ERROR_LOADING_LAYERS = '[Layers] Error loading layers',
	UPDATE_SELECTED_LAYERS_IDS = '[Layers] Update selected layers ids',
	SET_LAYER_SELECTION = '[Layers] Set layer selection',
	SELECT_ONLY = '[Layers] Select only',
	ADD_LAYER = '[Layers] Add layer',
	UPDATE_LAYER = '[Layers] Update layer',
	REMOVE_LAYER = '[Layers] Remove layer',
	SET_ACTIVE_ANNOTATION_LAYER = '[Layers] Set active annotation layer',
	SET_MODAL = '[Layers] Set modal value',
	DELETE_ALL_DEFAULT_CASE_LAYERS = '[Layers] Delete All DefaultCase Layers'
};

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
	| CloseLayersModal
	| DeleteAllDefaultCaseLayersAction;

export class DeleteAllDefaultCaseLayersAction implements Action {
	type = LayersActionTypes.DELETE_ALL_DEFAULT_CASE_LAYERS;

	constructor() {
	}
}

export class BeginLayerCollectionLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD;

	constructor(public payload: { caseId: string }) {
	}
}

export class LayerCollectionLoadedAction implements Action {
	type = LayersActionTypes.LAYER_COLLECTION_LOADED;

	constructor(public payload: ILayer[]) {
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

export class SetLayerSelection implements Action {
	readonly type = LayersActionTypes.SET_LAYER_SELECTION;

	constructor(public payload: { id: string, value: boolean }) {
	}
}

export class SelectOnlyLayer implements Action {
	readonly type = LayersActionTypes.SELECT_ONLY;

	constructor(public payload: string) {
	}
}

export class AddLayer implements Action {
	readonly type = LayersActionTypes.ADD_LAYER;

	constructor(public payload: ILayer) {
	}
}

export class UpdateLayer implements Action {
	readonly type = LayersActionTypes.UPDATE_LAYER;

	constructor(public payload: ILayer) {
	}
}

export class RemoveLayer implements Action {
	readonly type = LayersActionTypes.REMOVE_LAYER;

	constructor(public payload: string) {

	}
}

export class SetActiveAnnotationLayer implements Action {
	type = LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER;

	constructor(public payload: string) {

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

