import { LayerCollectionLoadedAction, ToggleDisplayAnnotationsLayer } from '../actions/layers.actions';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
import { Layer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

describe('LayersReducer', () => {

	it('LAYER_COLLECTION_LOADED action should add the new layers to the state', () => {
		let staticLayer: Layer = {
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.static,
			creationTime: new Date()
		};

		let action: LayerCollectionLoadedAction = new LayerCollectionLoadedAction([staticLayer]);

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.layers).toEqual([staticLayer]);
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
	});

});
