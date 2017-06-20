import { MapActions, MapActionTypes } from '../actions/map.actions';
import { Position } from '@ansyn/core'
import { cloneDeep } from 'lodash';

export interface IMapState {
	positions: Position
	communicators: {}
}

export const initialMapState: IMapState = {
	positions: {} as any,
	communicators: {}
};

export function MapReducer(state: IMapState = initialMapState, action: MapActions ) {

	switch (action.type) {
		case MapActionTypes.POSITION_CHANGED:
			const positions = cloneDeep(state.positions);
			positions[action.payload.id] = action.payload.position;
			return Object.assign(state, {positions});

		case MapActionTypes.ADD_MAP_INSTANCE:
		case MapActionTypes.REMOVE_MAP_INSTACNE:
			return Object.assign(state, {communicators: action.payload.communicatorsIds});

		case MapActionTypes.UPDATE_MAP_SIZE:
			return state;


		default:
			return state;
	}
}
