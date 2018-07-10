import { LayerCollectionLoadedAction } from '../actions/layers.actions';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
import { ILayer, layerPluginType, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

describe('LayersReducer', () => {

	it('LAYER_COLLECTION_LOADED action should add the new layers to the state', () => {
		let staticLayer: ILayer = {
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.static,
			creationTime: new Date(),
			layerPluginType: layerPluginType.OSM
		};

		let action: LayerCollectionLoadedAction = new LayerCollectionLoadedAction([staticLayer]);

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.layers).toEqual([staticLayer]);
	});

});
