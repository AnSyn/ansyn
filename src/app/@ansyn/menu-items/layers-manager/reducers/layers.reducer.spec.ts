// import {
// 	LayerTreeLoadedAction,
// 	SelectLayerAction, SetAnnotationsLayer, ToggleDisplayAnnotationsLayer,
// 	UnselectLayerAction
// } from '../actions/layers.actions';
// import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
// import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
// import { ILayerTreeNode } from '../models/layer-tree-node';
// import { LayerType } from '../models/layer-type';
// import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
//
// describe('LayersReducer', () => {
//
// 	it('LAYER_TREE_LOADED action should add the new tree to the state', () => {
// 		let staticLeaf: ILayerTreeNodeLeaf = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			url: 'fakeUrl',
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let staticLayer: ILayerTreeNodeRoot = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			type: LayerType.static,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[staticLeaf]
// 		};
// 		let dynamicLayer: ILayerTreeNodeRoot = {
// 			name: 'dynamicLayer',
// 			id: 'dynamicLayerId',
// 			isChecked: false,
// 			type: LayerType.dynamic,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let complexLayer: ILayerTreeNodeRoot = {
// 			name: 'complexLayers',
// 			id: 'complexLayersId',
// 			isChecked: false,
// 			type: LayerType.complex,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
//
// 		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
//
// 		let action: LayerTreeLoadedAction = new LayerTreeLoadedAction({
// 			layers: layers, selectedLayers: [staticLeaf]
// 		});
//
// 		let result: ILayerState = LayersReducer(initialLayersState, action);
// 		expect(result.layers).toEqual(layers);
// 		expect(result.selectedLayers).toEqual([staticLeaf]);
// 	});
//
// 	it('SELECT_LAYER action should add the newly selected layer to the selectedLayers list', () => {
// 		let staticLeaf: ILayerTreeNodeLeaf = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			url: 'fakeUrl',
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let staticLayer: ILayerTreeNodeRoot = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			type: LayerType.static,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[staticLeaf]
// 		};
// 		let dynamicLayer: ILayerTreeNodeRoot = {
// 			name: 'dynamicLayer',
// 			id: 'dynamicLayerId',
// 			isChecked: false,
// 			type: LayerType.dynamic,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let complexLayer: ILayerTreeNodeRoot = {
// 			name: 'complexLayers',
// 			id: 'complexLayersId',
// 			isChecked: false,
// 			type: LayerType.complex,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
//
// 		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
//
// 		let action: SelectLayerAction = new SelectLayerAction(staticLeaf);
//
// 		let result: ILayerState = LayersReducer(<ILayerState>{ layers: layers, selectedLayers: [staticLeaf] }, action);
//
// 		expect(result.layers).toEqual(layers);
// 		expect(result.selectedLayers).toEqual([staticLeaf]);
// 	});
//
// 	it('SELECT_LAYER action with already selected layer should keep the old state', () => {
// 		let staticLeaf: ILayerTreeNodeLeaf = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			url: 'fakeUrl',
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let staticLayer: ILayerTreeNodeRoot = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			type: LayerType.static,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[staticLeaf]
// 		};
// 		let dynamicLayer: ILayerTreeNodeRoot = {
// 			name: 'dynamicLayer',
// 			id: 'dynamicLayerId',
// 			isChecked: false,
// 			type: LayerType.dynamic,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let complexLayer: ILayerTreeNodeRoot = {
// 			name: 'complexLayers',
// 			id: 'complexLayersId',
// 			isChecked: false,
// 			type: LayerType.complex,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
//
// 		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
//
// 		let action: SelectLayerAction = new SelectLayerAction(staticLeaf);
//
// 		let result: ILayerState = LayersReducer(<ILayerState>{ layers: layers, selectedLayers: [staticLeaf] }, action);
//
// 		expect(result.layers).toEqual(layers);
// 		expect(result.selectedLayers).toEqual([staticLeaf]);
// 	});
//
// 	it('UNSELECT_LAYER action should remove the newly unselected layer from the selectedLayers list', () => {
// 		let staticLeaf: ILayerTreeNodeLeaf = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			url: 'fakeUrl',
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let staticLayer: ILayerTreeNodeRoot = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			type: LayerType.static,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[staticLeaf]
// 		};
// 		let dynamicLayer: ILayerTreeNodeRoot = {
// 			name: 'dynamicLayer',
// 			id: 'dynamicLayerId',
// 			isChecked: false,
// 			type: LayerType.dynamic,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let complexLayer: ILayerTreeNodeRoot = {
// 			name: 'complexLayers',
// 			id: 'complexLayersId',
// 			isChecked: false,
// 			type: LayerType.complex,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
//
// 		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
//
// 		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);
//
// 		let result: ILayerState = LayersReducer(<ILayerState>{ layers: layers, selectedLayers: [staticLeaf] }, action);
//
// 		expect(result.layers).toEqual(layers);
// 		expect(result.selectedLayers).toEqual([]);
// 	});
//
// 	it('UNSELECT_LAYER action with already unselected layer should return the old state', () => {
// 		let staticLeaf: ILayerTreeNodeLeaf = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			url: 'fakeUrl',
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let staticLayer: ILayerTreeNodeRoot = {
// 			name: 'staticLayer',
// 			id: 'staticLayerId',
// 			isChecked: false,
// 			type: LayerType.static,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[staticLeaf]
// 		};
// 		let dynamicLayer: ILayerTreeNodeRoot = {
// 			name: 'dynamicLayer',
// 			id: 'dynamicLayerId',
// 			isChecked: false,
// 			type: LayerType.dynamic,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
// 		let complexLayer: ILayerTreeNodeRoot = {
// 			name: 'complexLayers',
// 			id: 'complexLayersId',
// 			isChecked: false,
// 			type: LayerType.complex,
// 			isIndeterminate: false,
// 			children: <ILayerTreeNode[]>[]
// 		};
//
// 		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
//
// 		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);
//
// 		let result: ILayerState = LayersReducer(<ILayerState>{ layers: layers, selectedLayers: [] }, action);
//
// 		expect(result.layers).toEqual(layers);
// 		expect(result.selectedLayers).toEqual([]);
// 	});
//
// 	describe('ANNOTATIONS', () => {
//
// 		it('TOGGLE_DISPLAY_LAYER', () => {
// 			let action = new ToggleDisplayAnnotationsLayer( true );
// 			let result: ILayerState = LayersReducer(initialLayersState, action);
// 			expect(result.displayAnnotationsLayer).toBeTruthy();
//
// 			action = new ToggleDisplayAnnotationsLayer( false);
// 			result = LayersReducer(initialLayersState, action);
// 			expect(result.displayAnnotationsLayer).toBeFalsy()
// 		});
//
// 		it('SET_LAYER', () => {
// 			const action = new SetAnnotationsLayer(<any>'some geoJSON Object');
// 			const result: ILayerState = LayersReducer(initialLayersState, action);
// 			expect(result.annotationsLayer).toEqual(<any>'some geoJSON Object');
// 		});
// 	})
//
// });
