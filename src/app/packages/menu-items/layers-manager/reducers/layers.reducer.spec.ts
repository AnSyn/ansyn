import {
	HideAnnotationsLayer,
	LayerTreeLoadedAction, SelectLayerAction, ShowAnnotationsLayer,
	UnselectLayerAction
} from '../actions/layers.actions';
import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { ILayerTreeNode } from '../models/layer-tree-node';
import { LayerType } from '../models/layer-type';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';

describe('LayersReducer', () => {

	it('LAYER_TREE_LOADED action should add the new tree to the state', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakeUrl',
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let staticLayer: ILayerTreeNodeRoot = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			type: LayerType.static,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[staticLeaf]
		};
		let dynamicLayer: ILayerTreeNodeRoot = {
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			type: LayerType.dynamic,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let complexLayer: ILayerTreeNodeRoot = {
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			type: LayerType.complex,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};

		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

		let action: LayerTreeLoadedAction = new LayerTreeLoadedAction({
			layers: layers, selectedLayers: [staticLeaf]
		});

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.layers).toEqual(layers);
		expect(result.selectedLayers).toEqual([staticLeaf]);
	});

	it('SELECT_LAYER action should add the newly selected layer to the selectedLayers list', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakeUrl',
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let staticLayer: ILayerTreeNodeRoot = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			type: LayerType.static,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[staticLeaf]
		};
		let dynamicLayer: ILayerTreeNodeRoot = {
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			type: LayerType.dynamic,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let complexLayer: ILayerTreeNodeRoot = {
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			type: LayerType.complex,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};

		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

		let action: SelectLayerAction = new SelectLayerAction(staticLeaf);

		let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [staticLeaf] }, action);

		expect(result.layers).toEqual(layers);
		expect(result.selectedLayers).toEqual([staticLeaf]);
	});

	it('SELECT_LAYER action with already selected layer should keep the old state', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakeUrl',
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let staticLayer: ILayerTreeNodeRoot = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			type: LayerType.static,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[staticLeaf]
		};
		let dynamicLayer: ILayerTreeNodeRoot = {
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			type: LayerType.dynamic,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let complexLayer: ILayerTreeNodeRoot = {
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			type: LayerType.complex,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};

		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

		let action: SelectLayerAction = new SelectLayerAction(staticLeaf);

		let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [staticLeaf] }, action);

		expect(result.layers).toEqual(layers);
		expect(result.selectedLayers).toEqual([staticLeaf]);
	});

	it('UNSELECT_LAYER action should remove the newly unselected layer from the selectedLayers list', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakeUrl',
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let staticLayer: ILayerTreeNodeRoot = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			type: LayerType.static,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[staticLeaf]
		};
		let dynamicLayer: ILayerTreeNodeRoot = {
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			type: LayerType.dynamic,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let complexLayer: ILayerTreeNodeRoot = {
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			type: LayerType.complex,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};

		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);

		let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [staticLeaf] }, action);

		expect(result.layers).toEqual(layers);
		expect(result.selectedLayers).toEqual([]);
	});

	it('UNSELECT_LAYER action with already unselected layer should return the old state', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakeUrl',
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let staticLayer: ILayerTreeNodeRoot = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			type: LayerType.static,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[staticLeaf]
		};
		let dynamicLayer: ILayerTreeNodeRoot = {
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			type: LayerType.dynamic,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let complexLayer: ILayerTreeNodeRoot = {
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			type: LayerType.complex,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};

		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];

		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);

		let result: ILayerState = LayersReducer({ layers: layers, selectedLayers: [] }, action);

		expect(result.layers).toEqual(layers);
		expect(result.selectedLayers).toEqual([]);
	});

	it("SHOW_ANNOTATION_LAYER", () => {
		const action = new ShowAnnotationsLayer({update: true});
		const result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.displayAnnotationsLayer).toBe(true);
	})

	it("HIDE_ANNOTATION_LAYER", () => {
		const action = new HideAnnotationsLayer({update: true});
		const result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.displayAnnotationsLayer).toBe(false);
	})
});
