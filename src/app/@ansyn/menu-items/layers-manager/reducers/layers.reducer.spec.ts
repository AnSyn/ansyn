import {
	LayerCollectionLoadedAction,
	SelectLayerAction,
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer,
	UnselectLayerAction
} from '../actions/layers.actions';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
import { Layer, LayersContainer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

describe('LayersReducer', () => {

	it('LAYER_COLLECTION_LOADED action should add the new tree to the state', () => {
		let staticLayer: Layer = {
			url: 'fakeStaticUrl',
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			isIndeterminate: false
		};
		let dynamicLayer: Layer = {
			url: 'fakeDynamicUrl',
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			isIndeterminate: false
		};
		let complexLayer: Layer = {
			url: 'fakeComplexUrl',
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			isIndeterminate: false
		};

		let layers: Layer[] = [staticLayer, dynamicLayer, complexLayer];

		let action: LayerCollectionLoadedAction = new LayerCollectionLoadedAction({
			layersContainer: {
				type: LayerType.static, layerBundle: { layers: layers, selectedLayers: [staticLayer] }
			}
		});

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.layersContainer.layerBundle.layers).toEqual(layers);
		expect(result.layersContainer.layerBundle.selectedLayers).toEqual([staticLayer]);
	});

	it('SELECT_LAYER action should add the newly selected layer to the selectedLayers list', () => {
		let staticLayer: Layer = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakestaticUrl',
			isIndeterminate: false
		};
		let staticLayerContainer: LayersContainer = {
			type: LayerType.static,
			layerBundle: {
				layers: [staticLayer],
				selectedLayers: []
			}
		};
		let dynamicLayerContainer: LayersContainer = {
			type: LayerType.dynamic,
			layerBundle: {
				layers: [{
					name: 'dynamicLayer',
					id: 'dynamicLayerId',
					url: 'fakedynamicUrl',
					isChecked: false,
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};
		let complexLayerContainer: LayersContainer = {
			type: LayerType.complex,
			layerBundle: {
				layers: [{
					name: 'staticLayer',
					id: 'staticLayerId',
					isChecked: false,
					url: 'fakecomplexUrl',
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};

		let layersContainers: LayersContainer[] = [staticLayerContainer, dynamicLayerContainer, complexLayerContainer];
		let layers: Layer[] = [];
		for (let layersContainer of layersContainers) {
			layers.concat(layersContainer.layerBundle.layers);
		}
		let action: SelectLayerAction = new SelectLayerAction(staticLayer);

		let result: ILayerState = LayersReducer(<ILayerState>{
			layersContainer: {
				type: LayerType.static,
				layerBundle: { layers: layers, selectedLayers: [staticLayer] }
			}
		}, action);

		expect(result.layersContainer.layerBundle.layers).toEqual(layers);
		expect(result.layersContainer.layerBundle.selectedLayers).toEqual([staticLayer]);
	});

	it('SELECT_LAYER action with already selected layer should keep the old state', () => {
		let staticLayer: Layer = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakestaticUrl',
			isIndeterminate: false
		};
		let staticLayerContainer: LayersContainer = {
			type: LayerType.static,
			layerBundle: {
				layers: [staticLayer],
				selectedLayers: []
			}
		};
		let dynamicLayerContainer: LayersContainer = {
			type: LayerType.dynamic,
			layerBundle: {
				layers: [{
					name: 'dynamicLayer',
					id: 'dynamicLayerId',
					url: 'fakedynamicUrl',
					isChecked: false,
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};
		let complexLayerContainer: LayersContainer = {
			type: LayerType.complex,
			layerBundle: {
				layers: [{
					name: 'staticLayer',
					id: 'staticLayerId',
					isChecked: false,
					url: 'fakecomplexUrl',
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};

		let layersContainers: LayersContainer[] = [staticLayerContainer, dynamicLayerContainer, complexLayerContainer];
		let layers: Layer[] = [];
		for (let layersContainer of layersContainers) {
			layers.concat(layersContainer.layerBundle.layers);
		}
		let action: SelectLayerAction = new SelectLayerAction(staticLayer);

		let result: ILayerState = LayersReducer(<ILayerState>{
			layersContainer: {
				type: LayerType.static,
				layerBundle: { layers: layers, selectedLayers: [staticLayer] }
			}
		}, action);

		expect(result.layersContainer.layerBundle.layers).toEqual(layers);
		expect(result.layersContainer.layerBundle.selectedLayers).toEqual([staticLayer]);
	});

	it('UNSELECT_LAYER action should remove the newly unselected layer from the selectedLayers list', () => {
		let staticLayer: Layer = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakestaticUrl',
			isIndeterminate: false
		};
		let staticLayerContainer: LayersContainer = {
			type: LayerType.static,
			layerBundle: {
				layers: [staticLayer],
				selectedLayers: []
			}
		};
		let dynamicLayerContainer: LayersContainer = {
			type: LayerType.dynamic,
			layerBundle: {
				layers: [{
					name: 'dynamicLayer',
					id: 'dynamicLayerId',
					url: 'fakedynamicUrl',
					isChecked: false,
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};
		let complexLayerContainer: LayersContainer = {
			type: LayerType.complex,
			layerBundle: {
				layers: [{
					name: 'staticLayer',
					id: 'staticLayerId',
					isChecked: false,
					url: 'fakecomplexUrl',
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};
		let layersContainers: LayersContainer[] = [staticLayerContainer, dynamicLayerContainer, complexLayerContainer];
		let layers: Layer[] = [];
		for (let layersContainer of layersContainers) {
			layers.concat(layersContainer.layerBundle.layers);
		}
		let action: UnselectLayerAction = new UnselectLayerAction(staticLayer);

		let result: ILayerState = LayersReducer(<ILayerState>{
			// layersContainer: {
			// 	type: LayerType.static,
			// 	layerBundle: { layers: layers, selectedLayers: [staticLayer] }
			// }
		}, action);

		expect(result.layersContainer.layerBundle.layers).toEqual(layers);

		expect(result.layersContainer.layerBundle.selectedLayers).toEqual([]);
	});

	it('UNSELECT_LAYER action with already unselected layer should return the old state', () => {
		let staticLayer: Layer = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fakestaticUrl',
			isIndeterminate: false
		};
		let staticLayerContainer: LayersContainer = {
			type: LayerType.static,
			layerBundle: {
				layers: [staticLayer],
				selectedLayers: []
			}
		};
		let dynamicLayerContainer: LayersContainer = {
			type: LayerType.dynamic,
			layerBundle: {
				layers: [{
					name: 'dynamicLayer',
					id: 'dynamicLayerId',
					url: 'fakedynamicUrl',
					isChecked: false,
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};
		let complexLayerContainer: LayersContainer = {
			type: LayerType.complex,
			layerBundle: {
				layers: [{
					name: 'staticLayer',
					id: 'staticLayerId',
					isChecked: false,
					url: 'fakecomplexUrl',
					isIndeterminate: false
				}],
				selectedLayers: []
			}
		};

		let layersContainers: LayersContainer[] = [staticLayerContainer, dynamicLayerContainer, complexLayerContainer];
		let layers: Layer[] = [];
		for (let layersContainer of layersContainers) {
			layers.concat(layersContainer.layerBundle.layers);
		}
		let action: UnselectLayerAction = new UnselectLayerAction(staticLayer);

		let result: ILayerState = LayersReducer(<ILayerState>{
			layersContainer: {
				type: LayerType.static,
				layerBundle: { layers: layers, selectedLayers: [] }
			}
		}, action);

		expect(result.layersContainer.layerBundle.layers).toEqual(layers);
		expect(result.layersContainer.layerBundle.selectedLayers).toEqual([]);
	});

	describe('ANNOTATIONS', () => {

		it('TOGGLE_DISPLAY_LAYER', () => {
			let action = new ToggleDisplayAnnotationsLayer(true);
			let result: ILayerState = LayersReducer(initialLayersState, action);
			expect(result.displayAnnotationsLayer).toBeTruthy();

			action = new ToggleDisplayAnnotationsLayer(false);
			result = LayersReducer(initialLayersState, action);
			expect(result.displayAnnotationsLayer).toBeFalsy();
		});

		it('SET_LAYER', () => {
			const action = new SetAnnotationsLayer(<any>'some geoJSON Object');
			const result: ILayerState = LayersReducer(initialLayersState, action);
			expect(result.annotationsLayer).toEqual(<any>'some geoJSON Object');
		});
	});

});
