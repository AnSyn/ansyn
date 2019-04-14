import { createFeatureSelector, createSelector, MemoizedSelector } from "@ngrx/store";
import { SentinelActions, SentinelActionTypes } from "../actions/sentinel.actions";

export interface ISentinelLayer {
	name: string,
	title: string,
}

export interface ISentinelOverlay {
	id: string,
	name: string
}

export interface ISentinelState {
	selectedLayers: any,
	layers: ISentinelLayer[]
}

export const sentinelInitialState: ISentinelState = {
	selectedLayers: {defaultLayer: 'TRUE_COLOR'},
	layers: []
};
export const sentinelFeatureKey = 'sentinel';
export const sentinelStateSelector: MemoizedSelector<any, ISentinelState> = createFeatureSelector<ISentinelState>(sentinelFeatureKey);

export function SentinelReducer(state = sentinelInitialState, action: SentinelActions | any): ISentinelState {
	switch (action.type) {
		case SentinelActionTypes.SET_LAYER_ON_MAP:
			const { id, layer } = action.payload;
			const newLayer = {};
			newLayer[id] = layer;
			return { ...state, selectedLayers: { ...state.selectedLayers, ...newLayer } };
		case SentinelActionTypes.SET_ALL_LAYERS:
			const { payload: layers } = action;
			return { ...state, layers };
		default:
			return state;
	}

}


export const selectSentinelselectedLayers: MemoizedSelector<any, any> = createSelector(sentinelStateSelector, (sentinel) => sentinel && sentinel.selectedLayers);
export const selectSentinelLayers: MemoizedSelector<any, ISentinelLayer[]> = createSelector(sentinelStateSelector, (sentinel) => sentinel && sentinel.layers);
