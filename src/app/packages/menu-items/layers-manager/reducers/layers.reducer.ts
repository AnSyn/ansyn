import { ILayerState } from './layers.reducer';
import { ILayerTreeNodeRoot } from '@ansyn/core';
import { LayersActionTypes, LayersActions } from '../actions/layers.actions';
import { cloneDeep } from 'lodash';
import { findNodesByFilterFunc, idFilterFunc, connectParents, 
    turnIndeterminateOff, bubbleIndeterminateUp, bubbleActivationDown, bubbleActivationUp } from '../utils/layers.utils';

export interface ILayerState {
    layers: ILayerTreeNodeRoot[];
}

export const initialLayersState: ILayerState = {
    layers: []
};

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions) {
    switch (action.type) {

        case LayersActionTypes.LAYER_TREE_LOADED:
            {
                const layers = cloneDeep(action.payload.layers);
                connectParents(layers);

                return Object.assign({}, state, {
                    layers: layers
                });
            }

        case LayersActionTypes.SELECT_LEAF_LAYER:
            {
                const layers = cloneDeep(state.layers);
                const selectedLayer = findNodesByFilterFunc(layers, idFilterFunc, action.payload.id);

                selectedLayer[0].isChecked = true;

                bubbleActivationDown(selectedLayer[0], true);
                bubbleActivationUp(selectedLayer[0].parent, true);                
                turnIndeterminateOff(selectedLayer[0]);
                bubbleIndeterminateUp(selectedLayer[0]);

                return Object.assign({}, state, { layers });
            }

        case LayersActionTypes.UNSELECT_LEAF_LAYER:
            {
                const layers = cloneDeep(state.layers);
                const selectedLayer = findNodesByFilterFunc(layers, idFilterFunc, action.payload.id);

                selectedLayer[0].isChecked = false;

                bubbleActivationDown(selectedLayer[0], false);
                bubbleActivationUp(selectedLayer[0].parent, false);     
                turnIndeterminateOff(selectedLayer[0]);
                bubbleIndeterminateUp(selectedLayer[0]);

                return Object.assign({}, state, { layers });
            }

        case LayersActionTypes.ERROR_LOADING_LAYERS:
            return state;

        default:
            return state;
    }
}

