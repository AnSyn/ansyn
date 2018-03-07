import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { Action } from '@ngrx/store';
import { FeatureCollection } from 'geojson';

export const LayersActionTypes = {
	BEGIN_LAYER_TREE_LOAD: 'BEGIN_LAYER_TREE_LOAD',
	LAYER_TREE_LOADED: 'LAYER_TREE_LOADED',
	SELECT_LAYER: 'SELECT_LAYER',
	UNSELECT_LAYER: 'UNSELECT_LAYER',
	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
	ANNOTATIONS: {
		SET_LAYER: 'SET_LAYER',
		TOGGLE_DISPLAY_LAYER: 'TOGGLE_LAYER',
	}
};

export type LayersActions =
	| ToggleDisplayAnnotationsLayer
	| BeginLayerTreeLoadAction
	| LayerTreeLoadedAction
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



export class BeginLayerTreeLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_TREE_LOAD;
}

export class LayerTreeLoadedAction implements Action {
	type = LayersActionTypes.LAYER_TREE_LOADED;

	constructor(public payload: {
		layers: ILayerTreeNodeRoot[],
		selectedLayers: ILayerTreeNodeLeaf[]
	}) {
	}
}

export class SelectLayerAction implements Action {
	type = LayersActionTypes.SELECT_LAYER;

	constructor(public payload: ILayerTreeNodeLeaf) {
	}
}

export class UnselectLayerAction implements Action {
	type = LayersActionTypes.UNSELECT_LAYER;

	constructor(public payload: ILayerTreeNodeLeaf) {
	}
}

export class ErrorLoadingLayersAction implements Action {
	type = LayersActionTypes.ERROR_LOADING_LAYERS;

	constructor(public payload: string) {
	}
}
