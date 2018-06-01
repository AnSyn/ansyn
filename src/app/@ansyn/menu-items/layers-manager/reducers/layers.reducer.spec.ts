import {
	LayerCollectionLoadedAction,
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '../actions/layers.actions';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
import { Layer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

describe('LayersReducer', () => {

	it('LAYER_COLLECTION_LOADED action should add the new tree to the state', () => {
		let staticLayer: Layer = {
			url: 'fakeStaticUrl',
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false
		};
		let dynamicLayer: Layer = {
			url: 'fakeDynamicUrl',
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false
		};
		let complexLayer: Layer = {
			url: 'fakeComplexUrl',
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false
		};

		let layers: Layer[] = [staticLayer, dynamicLayer, complexLayer];
		const payload = [
			{
				type: LayerType.static,
				dataLayers: layers,
				id: '',
				name: 'FakeName',
				creationTime: new Date(),
				dataLayerContainers: []
			}
		];
		let action: LayerCollectionLoadedAction = new LayerCollectionLoadedAction(payload);

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.layersContainers).toEqual(payload);
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
