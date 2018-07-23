import { ILayerState } from './layers.reducer';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq } from 'lodash';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { EntitySelectors } from '@ngrx/entity/src/models';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { ILayer, LayerType } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from './layers-modal';
import { DataLayersService } from '../services/data-layers.service';

export const layersAdapter = createEntityAdapter<ILayer>();

export interface ILayerState extends EntityState<ILayer> {
	selectedLayersIds: string[];
	activeAnnotationLayer: string;
	modal: ILayerModal
}

export const initialLayersState: ILayerState = layersAdapter.getInitialState({
	selectedLayersIds: [],
	activeAnnotationLayer: null,
	modal: {
		layer: null,
		type: SelectedModalEnum.none
	}
});

export const layersFeatureKey = 'layers';
export const layersStateSelector: MemoizedSelector<any, ILayerState> = createFeatureSelector<ILayerState>(layersFeatureKey);

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any) {
	switch (action.type) {

		case LayersActionTypes.LAYER_COLLECTION_LOADED:
			let annotationLayer = action.payload.find(({ type }) => type === LayerType.annotation);
			let selectedLayersIds = state.selectedLayersIds;
			let activeAnnotationLayer = state.activeAnnotationLayer;
			let layers = action.payload;
			if (!annotationLayer) {
				annotationLayer = DataLayersService.generateAnnotationLayer();
				selectedLayersIds = [...selectedLayersIds, annotationLayer.id];
				layers = [annotationLayer, ...layers];
			}
			activeAnnotationLayer = annotationLayer.id;
			return layersAdapter.addAll(layers, { ...state, selectedLayersIds, activeAnnotationLayer });

		case LayersActionTypes.SET_LAYER_SELECTION: {
			const id = action.payload.id, ids = state.selectedLayersIds;
			const selectedLayersIds = action.payload.value ? uniq([...ids, id]) : ids.filter(layerId => id !== layerId);
			return { ...state, selectedLayersIds };
		}

		case LayersActionTypes.SELECT_ONLY: {
			const layer = state.entities[action.payload];
			let selectedLayersIds = uniq([...state.selectedLayersIds, layer.id]);
			selectedLayersIds = selectedLayersIds.filter((layerId) => {
				const checkLayer = state.entities[layerId];
				return checkLayer.type !== layer.type || checkLayer.id === layer.id;
			});
			return { ...state, selectedLayersIds };
		}

		case LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS:
			return { ...state, selectedLayersIds: action.payload };

		case LayersActionTypes.ADD_LAYER: {
			return layersAdapter.addOne(action.payload, {
				...state,
				selectedLayersIds: [...state.selectedLayersIds, action.payload.id]
			});
		}

		case LayersActionTypes.UPDATE_LAYER: {
			return layersAdapter.updateOne({ id: action.payload.id, changes: action.payload }, state);
		}

		case LayersActionTypes.REMOVE_LAYER: {
			const selectedLayersIds = state.selectedLayersIds.filter((id) => id !== action.payload);
			let activeAnnotationLayer = state.activeAnnotationLayer;
			if (action.payload === state.activeAnnotationLayer) {
				activeAnnotationLayer = (<string[]> state.ids).find((id) => (id !== action.payload) && (state.entities[id].type === LayerType.annotation));
			}
			return layersAdapter.removeOne(action.payload, { ...state, selectedLayersIds, activeAnnotationLayer });
		}

		case LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER:
			return { ...state, activeAnnotationLayer: action.payload };

		case LayersActionTypes.SET_MODAL:
			return { ...state, modal: action.payload };

		default:
			return state;
	}

}

export const { selectAll, selectEntities }: EntitySelectors<ILayer, ILayerState> = layersAdapter.getSelectors();
export const layersStateOrInitial = createSelector(layersStateSelector, (layersState: ILayerState) => layersState || initialLayersState);
export const selectLayers = createSelector(layersStateOrInitial, selectAll);
export const selectLayersEntities = createSelector(layersStateOrInitial, selectEntities);
export const selectSelectedLayersIds = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.selectedLayersIds);
export const selectActiveAnnotationLayer = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.activeAnnotationLayer);
export const selectLayersModal = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.modal);
