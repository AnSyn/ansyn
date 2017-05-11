import { ILayerTreeNodeRoot } from './../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from './../models/layer-tree-node-leaf';
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
        layers: ILayerTreeNodeRoot[],
        selectedLayers: ILayerTreeNodeLeaf[]
    }) { }
}

export class SelectLayerAction implements Action {
    type = LayersActionTypes.SELECT_LAYER;
    constructor(public payload: ILayerTreeNodeLeaf) { }
}

export class UnselectLayerAction implements Action {
    type = LayersActionTypes.UNSELECT_LAYER;
    constructor(public payload: ILayerTreeNodeLeaf) { }
}
