import { ILayerTreeNodeRoot } from '@ansyn/core';
import { ILayerTreeNodeLeaf } from '@ansyn/core';
import { Action } from '@ngrx/store';

export const LayersActionTypes = {
    LAYER_TREE_LOADED: 'LAYER_TREE_LOADED',

    SELECT_LEAF_LAYER: 'SELECT_LEAF_LAYER',
    UNSELECT_LEAF_LAYER: 'UNSELECT_LEAF_LAYER',

    ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS'
};

export type LayersActions = any;

export class LayerTreeLoadedAction implements Action {
    type = LayersActionTypes.LAYER_TREE_LOADED;
    constructor(public payload: {
        layers: ILayerTreeNodeRoot[]
    }) { }
}

export class SelectLeafLayerAction implements Action {
    type = LayersActionTypes.SELECT_LEAF_LAYER;
    constructor(public payload: ILayerTreeNodeLeaf) { }
}

export class UnselectLeafLayerAction implements Action {
    type = LayersActionTypes.UNSELECT_LEAF_LAYER;
    constructor(public payload: ILayerTreeNodeLeaf) { }
}

export class ErrorLoadingLayersAction implements Action {
    type = LayersActionTypes.ERROR_LOADING_LAYERS;
    constructor(public payload: string) { }
}
