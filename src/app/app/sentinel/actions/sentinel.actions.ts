import { createAction, props } from '@ngrx/store';
import { ISentinelLayer } from '../reducers/sentinel.reducer';

export enum SentinelActionTypes {
	SET_ALL_LAYERS = '[Sentinel] ALL_LAYERS',
	SET_LAYER_ON_MAP = '[Sentinel] SET_LAYER_ON_MAP'
}


export const SetSentinelLayerOnMap = createAction(
										SentinelActionTypes.SET_LAYER_ON_MAP,
										props<{ id: string, layer: string }>()
);

export const SetSentinelLayers = createAction(
									SentinelActionTypes.SET_ALL_LAYERS,
									props<{payload: ISentinelLayer[]}>()
);
