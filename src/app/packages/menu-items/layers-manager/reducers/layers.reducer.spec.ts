import { BeginLayerTreeLoadAction, LayerTreeLoadedAction, SelectLayerAction, UnselectLayerAction } from '../actions/layers.actions';
import { ILayerTreeNode } from './../models/layer-tree-node';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';

describe('LayersReducer', () => {

    it('LAYER_TREE_LOADED action should add the new tree to the state', () => {
        let staticLayer: ILayerTreeNode = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let dynamicLayer: ILayerTreeNode = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNode = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNode[] = [staticLayer, dynamicLayer, complexLayer];

        let action: LayerTreeLoadedAction = new LayerTreeLoadedAction({
            layers: layers, selectedLayers: []
        });

        let result: ILayerState = LayersReducer(initialLayersState, action);
        expect(result.layers).toEqual(layers);
        expect(result.selectedLayers).toEqual([]);
    });

});
