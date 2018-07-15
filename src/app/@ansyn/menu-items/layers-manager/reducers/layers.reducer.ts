import { ILayerState } from './layers.reducer';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { FeatureCollection } from 'geojson';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

export interface ILayerState {
	layers: ILayer[];
	annotationsLayer: FeatureCollection<any>;
	selectedLayersIds: string[];
}

export const initialLayersState: ILayerState = {
	layers: [],
	annotationsLayer: null,
	selectedLayersIds: [LayerType.annotation]
};

export const layersFeatureKey = 'layers';
export const layersStateSelector: MemoizedSelector<any, ILayerState> = createFeatureSelector<ILayerState>(layersFeatureKey);

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any) {
	switch (action.type) {

		case LayersActionTypes.LAYER_COLLECTION_LOADED:
			return { ...state, layers: action.payload };

		case LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS:
			return { ...state, selectedLayersIds: action.payload };

		case LayersActionTypes.ERROR_LOADING_LAYERS:
			return state;

		default:
			return state;
	}

}

export const layersStateOrInitial = createSelector(layersStateSelector, (layersState: ILayerState) => layersState || initialLayersState);
export const selectLayers = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.layers);
export const selectSelectedLayersIds = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.selectedLayersIds);
export const selectDisplayAnnotationsLayer = createSelector(selectSelectedLayersIds, (selectedLayersIds: string[]) => selectedLayersIds.includes(LayerType.annotation));
