import { ILayerState } from './layers.reducer';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq } from 'lodash';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { EntitySelectors } from '@ngrx/entity/src/models';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { ILayer, LayerType } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from './layers-modal';
import { Dictionary } from '@ngrx/entity/src/models';

export const layersAdapter: EntityAdapter<ILayer> = createEntityAdapter<ILayer>();

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

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any): ILayerState {
	switch (action.type) {

		case LayersActionTypes.LAYER_COLLECTION_LOADED:
			let annotationLayer = action.payload.find(({ type }) => type === LayerType.annotation);
			let selectedLayersIds = state.selectedLayersIds;
			let activeAnnotationLayer = state.activeAnnotationLayer;
			let layers = action.payload;
			activeAnnotationLayer = annotationLayer && annotationLayer.id;
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
				return checkLayer && (checkLayer.type !== layer.type || checkLayer.id === layer.id);
			});
			return { ...state, selectedLayersIds };
		}

		case LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS:
			return { ...state, selectedLayersIds: action.payload };

		case LayersActionTypes.ADD_LAYER: {
			let activeAnnotationLayer = state.activeAnnotationLayer;
			if (!activeAnnotationLayer && action.payload.type === LayerType.annotation) {
				activeAnnotationLayer = action.payload.id;
			}
			return layersAdapter.addOne(action.payload, {
				...state,
				selectedLayersIds: uniq([...state.selectedLayersIds, action.payload.id]),
				activeAnnotationLayer
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
				activeAnnotationLayer = (<string[]> state.ids).find((id) => (id !== action.payload) && (state.entities[id].type === LayerType.annotation));
			}
			return layersAdapter.removeOne(action.payload, { ...state, selectedLayersIds, activeAnnotationLayer });
		}

		case LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER:
			return { ...state, activeAnnotationLayer: action.payload };

		case LayersActionTypes.SET_MODAL:
			return { ...state, modal: action.payload };

		case LayersActionTypes.SHOW_ALL_LAYERS: {
			const selectedLayersIds = state.selectedLayersIds;
			const layersToShow = (<string[]>state.ids).filter((id) => state.entities[id].type === action.payload);
			return { ...state, selectedLayersIds: uniq([...selectedLayersIds, ...layersToShow]) }
		}

		default:
			return state;
	}

}

export const { selectAll, selectEntities }: EntitySelectors<ILayer, ILayerState> = layersAdapter.getSelectors();

export const layersStateOrInitial: MemoizedSelector<any, any> = createSelector(layersStateSelector, (layersState: ILayerState) => layersState || initialLayersState);
export const selectLayers: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, selectAll);
export const selectLayersEntities: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, <(state: any) => Dictionary<any>>selectEntities);
export const selectSelectedLayersIds: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.selectedLayersIds);
export const selectActiveAnnotationLayer: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.activeAnnotationLayer);
export const selectLayersModal: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.modal);
