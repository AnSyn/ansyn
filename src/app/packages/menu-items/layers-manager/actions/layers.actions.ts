import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { Action } from '@ngrx/store';

export const LayersActionTypes = {
	BEGIN_LAYER_TREE_LOAD: 'BEGIN_LAYER_TREE_LOAD',
	LAYER_TREE_LOADED: 'LAYER_TREE_LOADED',

	SELECT_LAYER: 'SELECT_LAYER',
	UNSELECT_LAYER: 'UNSELECT_LAYER',
	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
	COMMANDS: {
		SHOW_ANNOTATIONS_LAYER: 'SHOW_ANNOTATIONS_LAYER',
		HIDE_ANNOTATIONS_LAYER: 'HIDE_ANNOTATIONS_LAYER'
	}

};

export type LayersActions = any;

export class ShowAnnotationsLayer implements Action {
	type = LayersActionTypes.COMMANDS.SHOW_ANNOTATIONS_LAYER;

	constructor(public payload: { update: boolean }) {
	}
}

export class HideAnnotationsLayer implements Action {
	type = LayersActionTypes.COMMANDS.HIDE_ANNOTATIONS_LAYER;

	constructor(public payload: { update: boolean }) {
	}
}


export class BeginLayerTreeLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_TREE_LOAD;

	constructor(public payload: { caseId: string }) {
	}
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
