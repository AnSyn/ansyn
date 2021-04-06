import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq, uniqWith } from 'lodash';
import { createEntityAdapter, Dictionary, EntityAdapter, EntityState } from '@ngrx/entity';
import { ILayer, LayerSearchTypeEnum, LayerType } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from './layers-modal';
import { IVisualizerEntity } from '@ansyn/imagery';

export const layersAdapter: EntityAdapter<ILayer> = createEntityAdapter<ILayer>({sortComparer: (a, b) => +a.creationTime - +b.creationTime});

export interface ILayerState extends EntityState<ILayer> {
	selectedLayersIds: string[];
	activeAnnotationLayer: string;
	staticLayers: ILayer[];
	staticLayersError: boolean;
	staticLayersLoading: boolean;
	modal: ILayerModal;
	layerSearchType: LayerSearchTypeEnum;
	layerSearchPolygon: IVisualizerEntity;
}

export const initialLayersState: ILayerState = layersAdapter.getInitialState({
	selectedLayersIds: [],
	staticLayers: [],
	staticLayersError: false,
	staticLayersLoading: true,
	activeAnnotationLayer: null,
	modal: {
		layer: null,
		type: SelectedModalEnum.none
	},
	layerSearchType: LayerSearchTypeEnum.mapView,
	layerSearchPolygon: null
});

export const layersFeatureKey = 'layers';
export const layersStateSelector: MemoizedSelector<any, ILayerState> = createFeatureSelector<ILayerState>(layersFeatureKey);

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any): ILayerState {
	switch (action.type) {
		case LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD:
			return layersAdapter.removeAll({...state, selectedLayersIds: [], activeAnnotationLayer: null});

		case LayersActionTypes.LAYER_COLLECTION_LOADED:
			const annotationLayer = action.payload.find(({ type }) => type === LayerType.annotation);
			const staticLayers = action.payload.filter( layer => layer.type === LayerType.static);
			let activeAnnotationLayer = (annotationLayer && annotationLayer.id) || state.activeAnnotationLayer;
			let layers = action.payload.filter(layer => layer.type !== LayerType.static || state.selectedLayersIds.includes(layer.id));
			return layersAdapter.setAll(layers, { ...state, activeAnnotationLayer, staticLayers, staticLayersLoading: staticLayers.length === 0 });

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
				activeAnnotationLayer = (<string[]>state.ids).find((id) => (id !== action.payload) && (state.entities[id].type === LayerType.annotation));
				activeAnnotationLayer = (<string[]>state.ids).find((id) => (id !== action.payload) && (state.entities[id].type === LayerType.annotation));
			}
			return layersAdapter.removeOne(action.payload, { ...state, selectedLayersIds, activeAnnotationLayer });
		}

		case LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER:
			return { ...state, activeAnnotationLayer: action.payload };

		case LayersActionTypes.SET_LAYER_SEARCH_TYPE:
			return { ...state, layerSearchType: action.payload };

		case LayersActionTypes.SET_LAYER_SEARCH_POLYGON: {
			return { ...state, layerSearchPolygon: action.payload}
		}

		case LayersActionTypes.SET_MODAL:
			return { ...state, modal: action.payload };

		case LayersActionTypes.SHOW_ALL_LAYERS: {
			const selectedLayersIds = state.selectedLayersIds;
			const layersToShow = (<string[]>state.ids).filter((id) => state.entities[id].type === action.payload);
			return { ...state, selectedLayersIds: uniq([...selectedLayersIds, ...layersToShow]) };
		}

		case LayersActionTypes.ADD_STATIC_LAYERS: {
			const allStaticLayers = state.staticLayers.concat(action.payload);
			const uniqStaticLayers = uniqWith(allStaticLayers, (a, b) => a.id === b.id);
			const layersToAdd = action.payload.filter( layer => state.selectedLayersIds.includes(layer.id));
			return layersAdapter.addMany(layersToAdd, {...state, staticLayers: uniqStaticLayers,
				/*force render layers on load case */
				selectedLayersIds: [...state.selectedLayersIds]});
		}

		case LayersActionTypes.REFRESH_STATIC_LAYERS: {
			return { ...state, staticLayersLoading: true }
		}

		case LayersActionTypes.ERROR_LOADING_STATIC_LAYERS: {
			return { ...state, staticLayersLoading: false }
		}

		default:
			return state;
	}

}

export const { selectAll, selectEntities } = layersAdapter.getSelectors();

export const layersStateOrInitial: MemoizedSelector<any, any> = createSelector(layersStateSelector, (layersState: ILayerState) => layersState || initialLayersState);
export const selectLayers: MemoizedSelector<any, ILayer[]> = createSelector(layersStateOrInitial, selectAll);
export const selectLayersEntities: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, <(state: any) => Dictionary<any>>selectEntities);
export const selectSelectedLayersIds: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.selectedLayersIds);
export const selectActiveAnnotationLayer: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.activeAnnotationLayer);
export const selectLayersModal: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.modal);
export const selectStaticLayer: MemoizedSelector<any, ILayer[]> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState?.staticLayers);
export const selectIsErrorFetchStaticLayers: MemoizedSelector<any, boolean> = createSelector(layersStateOrInitial, (layerState: ILayerState) => layerState?.staticLayersError);
export const selectLayerSearchType: MemoizedSelector<any, LayerSearchTypeEnum> = createSelector(layersStateOrInitial, (layerState: ILayerState) => layerState?.layerSearchType);
export const selectLayerSearchPolygon: MemoizedSelector<ILayerState, IVisualizerEntity> = createSelector(layersStateOrInitial, (layerState: ILayerState) => layerState.layerSearchPolygon);
export const selectStaticLayersLoading: MemoizedSelector<any, boolean> = createSelector(layersStateOrInitial, (layerState: ILayerState) => layerState?.staticLayersLoading);
