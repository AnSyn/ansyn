import { Action } from '@ngrx/store';
import { FeatureCollection } from 'geojson';
import { Layer, LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';

export const LayersActionTypes = {
	BEGIN_LAYER_COLLECTION_LOAD: 'BEGIN_LAYER_COLLECTION_LOAD',
	LAYER_COLLECTION_LOADED: 'LAYER_COLLECTION_LOADED',
	SELECT_LAYER: 'SELECT_LAYER',
	UNSELECT_LAYER: 'UNSELECT_LAYER',
	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
	ANNOTATIONS: {
		SET_LAYER: 'SET_LAYER',
		TOGGLE_DISPLAY_LAYER: 'TOGGLE_LAYER'
	}
};

export type LayersActions =
	| ToggleDisplayAnnotationsLayer
	| BeginLayerCollectionLoadAction
	| LayerCollectionLoadedAction
	| SelectLayerAction
	| UnselectLayerAction
	| ErrorLoadingLayersAction;

export class ToggleDisplayAnnotationsLayer implements Action {
	type = LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER;

	constructor(public payload: boolean) {
	}
}

export class SetAnnotationsLayer implements Action {
	type = LayersActionTypes.ANNOTATIONS.SET_LAYER;

	constructor(public payload: FeatureCollection<any>) {
	}
}

export class BeginLayerCollectionLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD;
}

export class LayerCollectionLoadedAction implements Action {
	type = LayersActionTypes.LAYER_COLLECTION_LOADED;

	constructor(public payload: LayersContainer[] ) {
	}
}

export class SelectLayerAction implements Action {
	type = LayersActionTypes.SELECT_LAYER;

	constructor(public payload: Layer) {
	}
}

export class UnselectLayerAction implements Action {
	type = LayersActionTypes.UNSELECT_LAYER;

	constructor(public payload: Layer) {
	}
}

export class ErrorLoadingLayersAction implements Action {
	type = LayersActionTypes.ERROR_LOADING_LAYERS;

	constructor(public payload: string) {
	}
}
