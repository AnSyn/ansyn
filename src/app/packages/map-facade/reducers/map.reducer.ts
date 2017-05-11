import { MapActions, MapActionTypes } from '../actions/map.actions';
import { Position } from '@ansyn/core'

export interface IMapState {
	position: Position
}

export const initialMapState: IMapState = {
	position: {} as any
};

export function MapReducer(state: IMapState = initialMapState, action: MapActions ) {

	switch (action.type) {
		case MapActionTypes.POSITION_CHANGED:
			return Object.assign(state, {position: action.payload});

		case MapActionTypes.UPDATE_MAP_SIZE:
			return state;

		default:
			return state;
	}
}
