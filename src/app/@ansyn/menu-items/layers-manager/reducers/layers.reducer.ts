import { ILayerState } from './layers.reducer';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { FeatureCollection } from 'geojson';
import { LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';

export interface ILayerState {
	layersContainers: LayersContainer[];
	displayAnnotationsLayer: boolean;
	annotationsLayer: FeatureCollection<any>;
	selectedLayersIds: string[];
}

export const initialLayersState: ILayerState = {
	layersContainers: [],
	displayAnnotationsLayer: false,
	annotationsLayer: null,
	selectedLayersIds: []
};

export const layersFeatureKey = 'layers';
export const layersStateSelector: MemoizedSelector<any, ILayerState> = createFeatureSelector<ILayerState>(layersFeatureKey);

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any) {
	switch (action.type) {

		case LayersActionTypes.LAYER_COLLECTION_LOADED:
			return { ...state, layersContainers: action.payload };

		case LayersActionTypes.SELECT_LAYER:
			return { ...state, layersContainers: [...state.layersContainers] };

		case LayersActionTypes.UNSELECT_LAYER:
			return { ...state, layersContainers: [...state.layersContainers] };

		case LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER:
			return { ...state, displayAnnotationsLayer: action.payload };

		case LayersActionTypes.ANNOTATIONS.SET_LAYER:
			return { ...state, annotationsLayer: action.payload };

		case LayersActionTypes.UPDATE_SELECTED_LAYERS_FROM_CASE:
			return { ...state, selectedLayersIds: action.payload };

		case LayersActionTypes.UPDATE_SELECTED_LAYERS_TO_CASE:
			return { ...state, selectedLayersIds: action.payload}

		case LayersActionTypes.ERROR_LOADING_LAYERS:
			return state;

		default:
			return state;
	}

}

export const selectLayersContainers = createSelector(layersStateSelector, (layersState: ILayerState) => layersState.layersContainers);
export const selectAnnotationLayer = createSelector(layersStateSelector, (layersState: ILayerState) => layersState.annotationsLayer);
export const selectDisplayAnnotationsLayer = createSelector(layersStateSelector, (layersState: ILayerState) => layersState.displayAnnotationsLayer);
export const selectSelectedLayersIds = createSelector(layersStateSelector, (layersState: ILayerState) => layersState.selectedLayersIds);
