import { MapActions, MapActionTypes } from '../actions/map.actions';
import { CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { MapFacadeService } from '../services/map-facade.service';
import { layoutOptions } from '@ansyn/core/models/layout-options.model';
import { IMapState } from '@ansyn/map-facade/reducers/interfaces';

export const initialMapState: IMapState = {
	activeMapId: null,
	mapsList: [],
	isLoadingMaps: new Map<string, string>(),
	pendingMapsCount: 0,
	pendingOverlays: []
};



export function MapReducer(state: IMapState = initialMapState, action: MapActions | any) {

	switch (action.type) {

		case MapActionTypes.IMAGERY_REMOVED: {
			const isLoadingMaps = new Map(state.isLoadingMaps);
			isLoadingMaps.delete(action.payload.id);
			return { ...state, isLoadingMaps };
		}

		case MapActionTypes.VIEW.SET_IS_LOADING: {
			const isLoadingMaps = new Map(state.isLoadingMaps);
			const { mapId, show, text } = action.payload;
			if (show) {
				isLoadingMaps.set(mapId, text);
			} else {
				isLoadingMaps.delete(mapId);
			}
			return { ...state, isLoadingMaps };
		}
		case MapActionTypes.STORE.SET_MAPS_DATA:
			return { ...state, ...action.payload };

		case MapActionTypes.DECREASE_PENDING_MAPS_COUNT:
			const currentCount = state.pendingMapsCount;
			const newCount = currentCount === 0 ? currentCount : currentCount - 1;

			return { ...state, pendingMapsCount: newCount };

		case MapActionTypes.SET_PENDING_OVERLAYS:
			return { ...state, pendingOverlays: action.payload };

		case MapActionTypes.REMOVE_PENDING_OVERLAY:
			const pendingOverlaysClone = state.pendingOverlays.slice();
			pendingOverlaysClone.splice(pendingOverlaysClone.indexOf(action.payload), 1);

			return { ...state, pendingOverlays: pendingOverlaysClone };

		case CoreActionTypes.TOGGLE_MAP_LAYERS:
			const toggledMap = state.mapsList.find(map => map.id === action.payload.mapId);
			if (toggledMap) {
				toggledMap.flags.layers = !toggledMap.flags.layers;
			}
			return { ...state };

		case CoreActionTypes.SET_LAYOUT:
			const layout = layoutOptions.get(action.payload);
			if ( layout.mapsCount !== state.mapsList.length && state.mapsList.length) {
				const pendingMapsCount = Math.abs(layout.mapsCount - state.mapsList.length);
				const mapsDataChanges = MapFacadeService.setMapsDataChanges(state.mapsList, state.activeMapId, layout);
				return { ...state, pendingMapsCount, ...mapsDataChanges };
			}
			return state;

		default:
			return state;
	}
}
