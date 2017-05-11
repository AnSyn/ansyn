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
            layers: layers, selectedLayers: [dynamicLayer]
        });

        let result: ILayerState = LayersReducer(initialLayersState, action);
        expect(result.layers).toEqual(layers);
        expect(result.selectedLayers).toEqual([dynamicLayer]);
    });

    it('SELECT_LAYER action should add the newly selected layer to the selectedLayers list', () => {
        let staticLayer: ILayerTreeNode = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let dynamicLayer: ILayerTreeNode = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNode = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNode[] = [staticLayer, dynamicLayer, complexLayer];

        let action: SelectLayerAction = new SelectLayerAction(complexLayer);

        let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [dynamicLayer] }, action);

        expect(result.layers).toEqual(layers);
        expect(result.selectedLayers).toEqual([dynamicLayer, complexLayer]);
    });

    it('SELECT_LAYER action with already selected layer should keep the old state', () => {
        let staticLayer: ILayerTreeNode = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let dynamicLayer: ILayerTreeNode = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNode = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNode[] = [staticLayer, dynamicLayer, complexLayer];

        let action: SelectLayerAction = new SelectLayerAction(dynamicLayer);

        let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [dynamicLayer] }, action);

        expect(result.layers).toEqual(layers);
        expect(result.selectedLayers).toEqual([dynamicLayer]);
    });

    it('UNSELECT_LAYER action should remove the newly unselected layer from the selectedLayers list', () => {
        let staticLayer: ILayerTreeNode = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let dynamicLayer: ILayerTreeNode = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNode = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNode[] = [staticLayer, dynamicLayer, complexLayer];

        let action: UnselectLayerAction = new UnselectLayerAction(complexLayer);

        let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [dynamicLayer, complexLayer] }, action);

        expect(result.layers).toEqual(layers);
        expect(result.selectedLayers).toEqual([dynamicLayer]);
    });

    it('UNSELECT_LAYER action with already unselected layer should return the old state', () => {
        let staticLayer: ILayerTreeNode = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let dynamicLayer: ILayerTreeNode = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNode = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNode[] = [staticLayer, dynamicLayer, complexLayer];

        let action: UnselectLayerAction = new UnselectLayerAction(complexLayer);

        let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [dynamicLayer] }, action);

        expect(result.layers).toEqual(layers);
        expect(result.selectedLayers).toEqual([dynamicLayer]);
    });
});
