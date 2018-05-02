import { ILayerState } from './layers.reducer';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { FeatureCollection } from 'geojson';
import { Layer, LayersContainer } from '@ansyn/menu-items/layers-manager/services/data-layers.service';

export interface ILayerState {
	layersContainer: LayersContainer;
	displayAnnotationsLayer: boolean;
	annotationsLayer: FeatureCollection<any>;
}

export const initialLayersState: ILayerState = {
	layersContainer: {
		type: null,
		layerBundle: {
			layers: [],
			selectedLayers: []
		}
	},
	displayAnnotationsLayer: false,
	annotationsLayer: null

};

export const layersFeatureKey = 'layers';
export const layersStateSelector: MemoizedSelector<any, ILayerState> = createFeatureSelector<ILayerState>(layersFeatureKey);

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any) {
	switch (action.type) {

		case LayersActionTypes.BEGIN_LAYER_TREE_LOAD:
			return state;

		case LayersActionTypes.LAYER_TREE_LOADED:
			return Object.assign({}, state, {
				layersContainer: action.payload.layersContainer
			}
			);

		case LayersActionTypes.SELECT_LAYER:
			let selectedLayerIndex: number = state.layersContainer.layerBundle.selectedLayers.indexOf(action.payload);
			if (selectedLayerIndex > -1) {
				return state;
			}

			return Object.assign({}, state, { selectedLayers: state.layersContainer.layerBundle.selectedLayers.concat([action.payload]) });

		case LayersActionTypes.UNSELECT_LAYER:
			let unselectedLayerIndex: number = state.layersContainer.layerBundle.selectedLayers.indexOf(action.payload);
			if (unselectedLayerIndex === -1) {
				return state;
			}

			let newSelectedArray: Layer[] = [
				...state.layersContainer.layerBundle.selectedLayers.slice(0, unselectedLayerIndex),
				...state.layersContainer.layerBundle.selectedLayers.slice(unselectedLayerIndex + 1, state.layersContainer.layerBundle.selectedLayers.length)
			];
			return Object.assign({}, state, { selectedLayers: newSelectedArray });

		case LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER:
			return { ...state, displayAnnotationsLayer: action.payload };

		case LayersActionTypes.ANNOTATIONS.SET_LAYER:
			return { ...state, annotationsLayer: action.payload };


		case LayersActionTypes.ERROR_LOADING_LAYERS:
			return state;

		default:
			return state;
	}
}

