import { Action } from '@ngrx/store';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

export enum LayersActionTypes {
	BEGIN_LAYER_COLLECTION_LOAD = 'BEGIN_LAYER_COLLECTION_LOAD',
	LAYER_COLLECTION_LOADED = 'LAYER_COLLECTION_LOADED',
	ERROR_LOADING_LAYERS = 'ERROR_LOADING_LAYERS',
	UPDATE_SELECTED_LAYERS_IDS = 'UPDATE_SELECTED_LAYERS_IDS',
	TOGGLE_LAYER_SELECTION = '[Layers] TOGGLE_LAYER_SELECTION',
	SELECT_ONLY = '[Layers] Select only',
	SELECT_ALL = '[Layers] Select all',
	UPDATE_LAYER = '[Layers] Update layer',
};

export type LayersActions =
	| BeginLayerCollectionLoadAction
	| LayerCollectionLoadedAction
	| ErrorLoadingLayersAction
	| UpdateSelectedLayersIds
	| ToggleLayerSelection
	| SelectOnly
	| SelectAll
	| UpdateLayer;

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

export class ToggleLayerSelection {
	readonly type = LayersActionTypes.TOGGLE_LAYER_SELECTION;
	constructor(public payload: string) {
	}
}

export class SelectOnly {
	readonly type = LayersActionTypes.SELECT_ONLY;
	constructor(public payload: string) {
	}
}

export class SelectAll {
	readonly type = LayersActionTypes.SELECT_ALL;
	constructor(public payload: LayerType) {
	}
}

export class UpdateLayer {
	readonly type = LayersActionTypes.UPDATE_LAYER;
	constructor(public payload: ILayer) {
	}
}


