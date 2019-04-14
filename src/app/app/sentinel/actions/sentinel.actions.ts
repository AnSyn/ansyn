import { Action } from "@ngrx/store";
import { ISentinelLayer } from "../reducers/sentinel.reducer";

export enum SentinelActionTypes {
	SET_ALL_LAYERS = '[Sentinel] ALL_LAYERS',
	SET_LAYER_ON_MAP = '[Sentinel] SET_LAYER_ON_MAP'
}

export type SentinelActions = SetSentinelLayerOnMap | SetSentinelLayers;

export class SetSentinelLayerOnMap implements Action {
	type: string = SentinelActionTypes.SET_LAYER_ON_MAP;

	constructor(public payload: { id: string, layer: string }) {
	}
}

export class SetSentinelLayers implements Action {
	type: string = SentinelActionTypes.SET_ALL_LAYERS;

	constructor(public payload: ISentinelLayer[]) {
	}
}
