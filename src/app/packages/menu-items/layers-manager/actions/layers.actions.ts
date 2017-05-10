import { ILayerTreeNode } from './../models/layer-tree-node';
import { Action } from '@ngrx/store';

export const LayersActionTypes = {
    BEGIN_LAYER_TREE_LOAD: 'BEGIN_LAYER_TREE_LOAD',
    LAYER_TREE_LOADED: 'LAYER_TREE_LOADED',

    SELECT_LAYER: 'SELECT_LAYER',
    UNSELECT_LAYER: 'UNSELECT_LAYER'
};

export type LayersActions = any;

export class BeginLayerTreeLoadAction implements Action {
    type = LayersActionTypes.BEGIN_LAYER_TREE_LOAD;
    constructor(public payload: { caseId: string }) { }
}

export class LayerTreeLoadedAction implements Action {
    type = LayersActionTypes.LAYER_TREE_LOADED;
    constructor(public payload: {
        layers: ILayerTreeNode[],
        selectedLayers: ILayerTreeNode[]
    }) { }
}

export class SelectLayerAction implements Action {
    type = LayersActionTypes.SELECT_LAYER;
    constructor(public payload: ILayerTreeNode) { }
}

export class UnselectLayerAction implements Action {
    type = LayersActionTypes.UNSELECT_LAYER;
    constructor(public payload: ILayerTreeNode) { }
}
