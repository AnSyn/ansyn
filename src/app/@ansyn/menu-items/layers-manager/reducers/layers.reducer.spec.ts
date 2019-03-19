import { LayerCollectionLoadedAction, ShowAllLayers } from '../actions/layers.actions';
import { ILayerState, initialLayersState, LayersReducer } from './layers.reducer';
import { ILayer, layerPluginTypeEnum, LayerType } from '../models/layers.model';

describe('LayersReducer', () => {

	it('LAYER_COLLECTION_LOADED action should add the new layers to the state', () => {
		let staticLayer: ILayer = {
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.annotation,
			creationTime: new Date(),
			layerPluginType: layerPluginTypeEnum.Annotations
		};

		let action: LayerCollectionLoadedAction = new LayerCollectionLoadedAction([staticLayer]);

		let result: ILayerState = LayersReducer(initialLayersState, action);
		expect(result.ids).toEqual(['staticLayerId']);
	});

	it('SHOW_ALL_LAYERS action should check all layers in the layers collection', () => {
		const layersState: ILayerState = {
			...initialLayersState,
			selectedLayersIds: ['staticLayerId2'],
			entities: <any> {
				'annotations': {
					id: 'annotations',
					type: LayerType.annotation
				},
				'annotations1': {
					id: 'annotations1',
					type: LayerType.annotation
				},
				'staticLayerId': {
					id: 'staticLayerId',
					type: LayerType.static
				},
				'staticLayerId2': {
					id: 'staticLayerId2',
					type: LayerType.static
				}
			},
			ids: ['annotations', 'annotations1', 'staticLayerId', 'staticLayerId2']
		};

		let action = new ShowAllLayers(LayerType.annotation);
		let result: ILayerState = LayersReducer(layersState, action);
		['annotations', 'annotations1', 'staticLayerId2'].forEach((id) => {
			expect(result.selectedLayersIds).toContain(id);
		});
	});

});
