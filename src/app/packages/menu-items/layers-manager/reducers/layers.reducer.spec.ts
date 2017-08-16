import { LayerTreeLoadedAction, SelectLeafLayerAction, UnselectLeafLayerAction } from '../actions/layers.actions';
import { ILayerTreeNodeRoot, ILayerTreeNodeLeaf, ILayerTreeNode, LayerType } from '@ansyn/core';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';

describe('LayersReducer', () => {

    it('LAYER_TREE_LOADED action should add the new tree to the state', () => {
        let staticLeaf: ILayerTreeNodeLeaf = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, url: "fake_url", isIndeterminate: false, children: <ILayerTreeNode[]>[], source: null };
        let staticLayer: ILayerTreeNodeRoot = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, type: LayerType.static, isIndeterminate: false, children: <ILayerTreeNode[]>[staticLeaf] };
        let dynamicLayer: ILayerTreeNodeRoot = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, type: LayerType.dynamic, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNodeRoot = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, type: LayerType.complex, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

        let action: LayerTreeLoadedAction = new LayerTreeLoadedAction({ layers });

        let result: ILayerState = LayersReducer(initialLayersState, action);
        expect(result.layers).toEqual(layers);
    });

    it('SELECT_LAYER action should add the newly selected layer to the selectedLayers list', () => {
        let staticLeaf: ILayerTreeNodeLeaf = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, url: "fake_url", isIndeterminate: false, children: <ILayerTreeNode[]>[], source: null };
        let staticLayer: ILayerTreeNodeRoot = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, type: LayerType.static, isIndeterminate: false, children: <ILayerTreeNode[]>[staticLeaf] };
        let dynamicLayer: ILayerTreeNodeRoot = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, type: LayerType.dynamic, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNodeRoot = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, type: LayerType.complex, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

        let action: SelectLeafLayerAction = new SelectLeafLayerAction(staticLeaf);

        let result: ILayerState = LayersReducer({ layers }, action);

        expect(result.layers).toEqual(layers);
    });

    it('SELECT_LAYER action with already selected layer should keep the old state', () => {
        let staticLeaf: ILayerTreeNodeLeaf = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, url: "fake_url", isIndeterminate: false, children: <ILayerTreeNode[]>[], source: null };
        let staticLayer: ILayerTreeNodeRoot = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, type: LayerType.static, isIndeterminate: false, children: <ILayerTreeNode[]>[staticLeaf] };
        let dynamicLayer: ILayerTreeNodeRoot = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, type: LayerType.dynamic, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNodeRoot = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, type: LayerType.complex, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

        let action: SelectLeafLayerAction = new SelectLeafLayerAction(staticLeaf);

        let result: ILayerState = LayersReducer({ layers }, action);

        expect(result.layers).toEqual(layers);
    });

    it('UNSELECT_LAYER action should remove the newly unselected layer from the selectedLayers list', () => {
        let staticLeaf: ILayerTreeNodeLeaf = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, url: "fake_url", isIndeterminate: false, children: <ILayerTreeNode[]>[], source: null };
        let staticLayer: ILayerTreeNodeRoot = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, type: LayerType.static, isIndeterminate: false, children: <ILayerTreeNode[]>[staticLeaf] };
        let dynamicLayer: ILayerTreeNodeRoot = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, type: LayerType.dynamic, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNodeRoot = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, type: LayerType.complex, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

        let action: UnselectLeafLayerAction = new UnselectLeafLayerAction(staticLeaf);

        let result: ILayerState = LayersReducer({ layers }, action);

        expect(result.layers).toEqual(layers);
    });

    it('UNSELECT_LAYER action with already unselected layer should return the old state', () => {
        let staticLeaf: ILayerTreeNodeLeaf = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, url: "fake_url", isIndeterminate: false, children: <ILayerTreeNode[]>[], source: null };
        let staticLayer: ILayerTreeNodeRoot = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, type: LayerType.static, isIndeterminate: false, children: <ILayerTreeNode[]>[staticLeaf] };
        let dynamicLayer: ILayerTreeNodeRoot = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, type: LayerType.dynamic, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNodeRoot = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, type: LayerType.complex, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

        let action: UnselectLeafLayerAction = new UnselectLeafLayerAction(staticLeaf);

        let result: ILayerState = LayersReducer({ layers }, action);

        expect(result.layers).toEqual(layers);
    });
});
