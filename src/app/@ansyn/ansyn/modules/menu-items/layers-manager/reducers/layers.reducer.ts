import { LayerCollectionLoadedAction, SetLayerSelection, SelectOnlyLayer, UpdateSelectedLayersIds, AddLayer, UpdateLayer, RemoveLayer, SetActiveAnnotationLayer, SetLayersModal, ShowAllLayers, CloseLayersModal } from './../actions/layers.actions';
import { ILayerState } from './layers.reducer';
import { createFeatureSelector, createSelector, MemoizedSelector, createReducer, on, Action } from '@ngrx/store';
import { uniq } from 'lodash';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary, EntitySelectors } from '@ngrx/entity/src/models';
import { ILayer, LayerType } from '../models/layers.model';
import { ILayerModal, SelectedModalEnum } from './layers-modal';

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

const reducerFunction = createReducer(initialLayersState,
	on(LayerCollectionLoadedAction, (state, payload) => {
		let annotationLayer = payload.layers.find(({ type }) => type === LayerType.annotation);
		let selectedLayersIds = state.selectedLayersIds;
		let activeAnnotationLayer = state.activeAnnotationLayer;
		let layers = payload.layers;
		activeAnnotationLayer = annotationLayer && annotationLayer.id;
		return layersAdapter.addAll(layers, { ...state, selectedLayersIds, activeAnnotationLayer });
	}),
	on(SetLayerSelection, (state, payload) => {
		const id = payload.id, ids = state.selectedLayersIds;
		const selectedLayersIds = payload.value ? uniq([...ids, id]) : ids.filter(layerId => id !== layerId);
		return { ...state, selectedLayersIds };
	}),
	on(SelectOnlyLayer, (state, payload) => {
		const layer = state.entities[payload.id];
		let selectedLayersIds = uniq([...state.selectedLayersIds, layer.id]);
		selectedLayersIds = selectedLayersIds.filter((layerId) => {
			const checkLayer = state.entities[layerId];
			return checkLayer && (checkLayer.type !== layer.type || checkLayer.id === layer.id);
		});
		return { ...state, selectedLayersIds };
	}),
	on(UpdateSelectedLayersIds, (state, payload) => {
		return { ...state, selectedLayersIds: payload.layerIds };
	}),
	on(AddLayer, (state, payload) => {
		let activeAnnotationLayer = state.activeAnnotationLayer;
		if (!activeAnnotationLayer && payload.layer.type === LayerType.annotation) {
			activeAnnotationLayer = payload.layer.id;
		}
		return layersAdapter.addOne(payload.layer, {
			...state,
			selectedLayersIds: uniq([...state.selectedLayersIds, payload.layer.id]),
			activeAnnotationLayer
		});
	}),
	on(UpdateLayer, (state, payload) => {
		return layersAdapter.updateOne({ id: payload.layer.id, changes: payload.layer }, state);
	}),
	on(RemoveLayer, (state, payload) => {
		const selectedLayersIds = state.selectedLayersIds.filter(id => id !== payload.layerId);
		let activeAnnotationLayer = state.activeAnnotationLayer;
		if (payload.layerId === state.activeAnnotationLayer) {
			activeAnnotationLayer = (<string[]>state.ids).find((id) => (id !== payload.layerId) && (state.entities[id].type === LayerType.annotation));
			activeAnnotationLayer = (<string[]>state.ids).find((id) => (id !== payload.layerId) && (state.entities[id].type === LayerType.annotation));
		}
		return layersAdapter.removeOne(payload.layerId, { ...state, selectedLayersIds, activeAnnotationLayer });
	}),
	on(SetActiveAnnotationLayer, (state, payload) => {
		return { ...state, activeAnnotationLayer: payload.layerId };
	}),
	on(SetLayersModal, (state, payload) => {
		return { ...state, modal: payload.layer };
	}),
	on(CloseLayersModal, (state, payload) => {
		return { ...state, modal: { type: SelectedModalEnum.none, layer: null } };
	}),

	on(ShowAllLayers, (state, payload) => {
		const selectedLayersIds = state.selectedLayersIds;
		const layersToShow = (<string[]>state.ids).filter((id) => state.entities[id].type === payload.layerType);
		return { ...state, selectedLayersIds: uniq([...selectedLayersIds, ...layersToShow]) };
	} )

);

export function LayersReducer(state: ILayerState = initialLayersState, action: Action) {
	return reducerFunction(state, action);
}

export const { selectAll, selectEntities }: EntitySelectors<ILayer, ILayerState> = layersAdapter.getSelectors();

export const layersStateOrInitial: MemoizedSelector<any, any> = createSelector(layersStateSelector, (layersState: ILayerState) => layersState || initialLayersState);
export const selectLayers: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, selectAll);
export const selectLayersEntities: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, <(state: any) => Dictionary<any>>selectEntities);
export const selectSelectedLayersIds: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.selectedLayersIds);
export const selectActiveAnnotationLayer: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.activeAnnotationLayer);
export const selectLayersModal: MemoizedSelector<any, any> = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.modal);
