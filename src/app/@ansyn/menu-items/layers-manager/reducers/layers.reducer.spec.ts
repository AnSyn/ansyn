import { LayerCollectionLoadedAction } from '../actions/layers.actions';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
import { ILayer, layerPluginType, LayerType } from '../models/layers.model';

describe('LayersReducer', () => {

	it('LAYER_COLLECTION_LOADED action should add the new layers to the state', () => {
		let staticLayer: ILayer = {
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.annotation,
			creationTime: new Date(),
			layerPluginType: layerPluginType.Annotations
		};

		let action: LayerCollectionLoadedAction = new LayerCollectionLoadedAction([staticLayer]);

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.ids).toEqual(['staticLayerId']);
	});

});
