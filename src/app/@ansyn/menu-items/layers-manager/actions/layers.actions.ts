import { Action } from '@ngrx/store';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';

export const LayersActionTypes = {
	BEGIN_LAYER_COLLECTION_LOAD: 'BEGIN_LAYER_COLLECTION_LOAD',
	LAYER_COLLECTION_LOADED: 'LAYER_COLLECTION_LOADED',
	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
	UPDATE_SELECTED_LAYERS_IDS: 'UPDATE_SELECTED_LAYERS_IDS',
};

export type LayersActions =
	| BeginLayerCollectionLoadAction
	| LayerCollectionLoadedAction
	| ErrorLoadingLayersAction
	| UpdateSelectedLayersIds;

export class BeginLayerCollectionLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD;
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

