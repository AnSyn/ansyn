import { MapActions, MapActionTypes } from '../actions/map.actions';
import { MapsLayout } from '@ansyn/core/models';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { CoreActionTypes } from '@ansyn/core/actions/core.actions';

export interface MapsProgress {
	[key: string]: number
}

export interface IMapState {
	layout: MapsLayout;
	activeMapId: string;
	mapsList: CaseMapState[];
	mapsProgress: MapsProgress;
	mapsLoading: Set,
	pendingMapsCount: number; // number of maps to be opened
	pendingOverlays: string[]; // a list of overlays waiting for maps to be created in order to be displayed
}

export const initialMapState: IMapState = {
	layout: null,
	activeMapId: null,
	mapsList: [],
	mapsProgress: {},
	mapsLoading: new Set(),
	pendingMapsCount: 0,
	pendingOverlays: []
};

export const mapFeatureKey = 'map';

export const mapStateSelector: MemoizedSelector<any, IMapState> = createFeatureSelector<IMapState>(mapFeatureKey);

export function MapReducer(state: IMapState = initialMapState, action: MapActions | any) {

	switch (action.type) {
		case MapActionTypes.SET_PROGRESS_BAR:
			const mapsProgress = { ...state.mapsProgress, [action.payload.mapId]: action.payload.progress };
			return { ...state, mapsProgress };

		case MapActionTypes.SET_LAYOUT:
			return { ...state, layout: action.payload };

		case MapActionTypes.STORE.SET_MAPS_DATA:
			return { ...state, ...action.payload };

		case MapActionTypes.SET_PENDING_MAPS_COUNT:
			return { ...state, pendingMapsCount: action.payload };

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

		default:
			return state;
	}
}
