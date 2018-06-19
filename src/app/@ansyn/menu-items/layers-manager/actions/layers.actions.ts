import { Action } from '@ngrx/store';
import { Layer } from '@ansyn/menu-items/layers-manager/models/layers.model';

export const LayersActionTypes = {
	BEGIN_LAYER_COLLECTION_LOAD: 'BEGIN_LAYER_COLLECTION_LOAD',
	LAYER_COLLECTION_LOADED: 'LAYER_COLLECTION_LOADED',
	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
	ANNOTATIONS: {
		TOGGLE_DISPLAY_LAYER: 'TOGGLE_LAYER'
	},
	UPDATE_SELECTED_LAYERS_IDS: 'UPDATE_SELECTED_LAYERS_IDS',
};

export type LayersActions =
	| ToggleDisplayAnnotationsLayer
	| BeginLayerCollectionLoadAction
	| LayerCollectionLoadedAction
	| ErrorLoadingLayersAction
	| UpdateSelectedLayersIds;

export class ToggleDisplayAnnotationsLayer implements Action {
	type = LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER;

	constructor(public payload: boolean) {
	}
}

export class BeginLayerCollectionLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD;
}

export class LayerCollectionLoadedAction implements Action {
	type = LayersActionTypes.LAYER_COLLECTION_LOADED;

	constructor(public payload: Layer[]) {
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

