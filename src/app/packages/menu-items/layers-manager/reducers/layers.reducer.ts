import { ILayerState } from './layers.reducer';
import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { FeatureCollection } from 'geojson';

export interface ILayerState {
	layers: ILayerTreeNodeRoot[];
	selectedLayers: ILayerTreeNodeLeaf[];
	displayAnnotationsLayer: boolean;
	annotationsLayer: FeatureCollection<any>;
}

export const initialLayersState: ILayerState = {
	layers: [],
	selectedLayers: [],
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
				layers: action.payload.layers,
				selectedLayers: action.payload.selectedLayers
			});

		case LayersActionTypes.SELECT_LAYER:
			let selectedLayerIndex: number = state.selectedLayers.indexOf(action.payload);
			if (selectedLayerIndex > -1) {
				return state;
			}

			return Object.assign({}, state, { selectedLayers: state.selectedLayers.concat([action.payload]) });

		case LayersActionTypes.UNSELECT_LAYER:
			let unselectedLayerIndex: number = state.selectedLayers.indexOf(action.payload);
			if (unselectedLayerIndex === -1) {
				return state;
			}

			let newSelectedArray: ILayerTreeNodeLeaf[] = [
				...state.selectedLayers.slice(0, unselectedLayerIndex),
				...state.selectedLayers.slice(unselectedLayerIndex + 1, state.selectedLayers.length)
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

