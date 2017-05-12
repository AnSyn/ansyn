import { ILayerState } from './layers.reducer';
import { ILayerTreeNodeRoot } from './../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from './../models/layer-tree-node-leaf';
import { LayersActionTypes, LayersActions } from '../actions/layers.actions';

export interface ILayerState {
    layers: ILayerTreeNodeRoot[];
    selectedLayers: ILayerTreeNodeLeaf[];
}

export const initialLayersState: ILayerState = {
    layers: [],
    selectedLayers: []
};

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions) {
    switch (action.type) {

        case LayersActionTypes.BEGIN_LAYER_TREE_LOAD:
            return state;

        case LayersActionTypes.LAYER_TREE_LOADED:
            return Object.assign({}, state, {
                layers: action.payload.layers,
                selectedLayers: action.payload.selectedLayers
            });

        case LayersActionTypes.SELECT_LAYER:
            let selectedLayerIndex: number = state.selectedLayers.indexOf(action.payload);
            if (selectedLayerIndex > -1){
                return state;
            }

            return Object.assign({}, state, { selectedLayers: state.selectedLayers.concat([action.payload]) });

        case LayersActionTypes.UNSELECT_LAYER:
            let unselectedLayerIndex: number = state.selectedLayers.indexOf(action.payload);
            if(unselectedLayerIndex === -1){
                return state;
            }
            
            let newSelectedArray: ILayerTreeNodeLeaf[] = [
                ...state.selectedLayers.slice(0, unselectedLayerIndex),
                ...state.selectedLayers.slice(unselectedLayerIndex + 1, state.selectedLayers.length)];
            return Object.assign({}, state, { selectedLayers: newSelectedArray });

        default:
            return state;
    }
}

