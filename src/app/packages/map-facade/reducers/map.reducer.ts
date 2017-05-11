import { MapActions, MapActionTypes } from '../actions/map.actions';
export interface IMapState {
	position: GeoJSON.Polygon
}

export const initialMapState: IMapState = {
	position: {} as any
};

export function MapReducer(state: IMapState = initialMapState, action: MapActions ) {

	switch (action.type) {
		case MapActionTypes.POSITION_CHANGED:
			return state;

		case MapActionTypes.UPDATE_MAP_SIZE:
			return state;

		default:
			return state;
	}
}
