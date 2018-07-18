import { ILayerState } from './layers.reducer';
import { LayersActions, LayersActionTypes } from '../actions/layers.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { uniq } from 'lodash';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IMenuState, menuItemsAdapter } from '@ansyn/menu/reducers/menu.reducer';
import { IMenuItem } from '@ansyn/menu/models/menu-item.model';
import { EntitySelectors } from '@ngrx/entity/src/models';

export const layersAdapter = createEntityAdapter<ILayer>();

export interface ILayerState extends EntityState<ILayer> {
	selectedLayersIds: string[];
}

export const initialLayersState: ILayerState = layersAdapter.getInitialState({
	selectedLayersIds: []
});

export const layersFeatureKey = 'layers';
export const layersStateSelector: MemoizedSelector<any, ILayerState> = createFeatureSelector<ILayerState>(layersFeatureKey);

export function LayersReducer(state: ILayerState = initialLayersState, action: LayersActions | any) {
	switch (action.type) {

		case LayersActionTypes.LAYER_COLLECTION_LOADED:
			return layersAdapter.addAll(action.payload, state);

		case LayersActionTypes.TOGGLE_LAYER_SELECTION: {
			const id = action.payload, ids = state.selectedLayersIds;
			const include = state.selectedLayersIds.includes(id);
			const selectedLayersIds = include ? ids.filter(layerId => id !== layerId) : [...ids, id];
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

		case LayersActionTypes.SELECT_ALL: {
			const collectionLayersIds = (<string[]> state.ids)
				.filter((id: any) => state.entities[id].type === action.payload);
			const selectedLayersIds = uniq(state.selectedLayersIds.concat(collectionLayersIds));
			return { ...state, selectedLayersIds };
		}

		case LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS:
			return { ...state, selectedLayersIds: action.payload };

		case LayersActionTypes.UPDATE_LAYER: {
			return layersAdapter.updateOne({ id: action.payload.id, changes: action.payload }, state);
		}

		default:
			return state;
	}

}
export const { selectAll, selectEntities }: EntitySelectors<ILayer, ILayerState> = layersAdapter.getSelectors();
export const layersStateOrInitial = createSelector(layersStateSelector, (layersState: ILayerState) => layersState || initialLayersState);
export const selectLayers = createSelector(layersStateOrInitial, selectAll);
export const selectLayersEntities = createSelector(layersStateOrInitial, selectEntities );
export const selectSelectedLayersIds = createSelector(layersStateOrInitial, (layersState: ILayerState) => layersState.selectedLayersIds);
export const selectDisplayAnnotationsLayer = createSelector(layersStateOrInitial, (layersState: ILayerState) => {
	const layerId = (<string[]>layersState.ids).find((id) => layersState.entities[id].type === LayerType.annotation);
	return layersState.selectedLayersIds.includes(layerId);
});
