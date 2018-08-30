import { MapActions, MapActionTypes } from '../actions/map.actions';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { layoutOptions } from '@ansyn/core/models/layout-options.model';
import { range } from 'lodash';
import { UUID } from 'angular2-uuid';
import { IPendingOverlay } from '@ansyn/core/models/overlay.model';

export function setMapsDataChanges(oldMapsList, oldActiveMapId, layout): { mapsList?: ICaseMapState[], activeMapId?: string } {
	const mapsList: ICaseMapState[] = [];
	const activeMap: ICaseMapState = oldMapsList.find(({ id }) => oldActiveMapId === id);

	range(layout.mapsCount).forEach((index) => {
		if (oldMapsList[index]) {
			mapsList.push(oldMapsList[index]);
		} else {
			const mapStateCopy: ICaseMapState = {
				id: UUID.UUID(),
				data: { position: null },
				mapType: activeMap.mapType,
				sourceType: activeMap.sourceType,
				flags: {}
			};
			mapsList.push(mapStateCopy);
		}
	});

	const mapsListChange = { mapsList };

	/* activeMapId */
	const notExist = !mapsList.some(({ id }) => id === oldActiveMapId);
	if (notExist) {
		mapsList[mapsList.length - 1] = activeMap;
	}

	return { ...mapsListChange };
}

export interface IMapState {
	activeMapId: string;
	mapsList: ICaseMapState[];
	isLoadingMaps: Map<string, string>,
	isHiddenMaps: Set<string>,
	pendingMapsCount: number; // number of maps to be opened
	pendingOverlays: IPendingOverlay[]; // a list of overlays waiting for maps to be created in order to be displayed
}


export const initialMapState: IMapState = {
	activeMapId: null,
	mapsList: [],
	isLoadingMaps: new Map<string, string>(),
	isHiddenMaps: new Set<string>(),
	pendingMapsCount: 0,
	pendingOverlays: []
};

export const mapFeatureKey = 'map';

export const mapStateSelector: MemoizedSelector<any, IMapState> = createFeatureSelector<IMapState>(mapFeatureKey);

export function MapReducer(state: IMapState = initialMapState, action: MapActions | any) {

	switch (action.type) {

		case MapActionTypes.IMAGERY_REMOVED: {
			const isLoadingMaps = new Map(state.isLoadingMaps);
			isLoadingMaps.delete(action.payload.id);

			const isHiddenMaps = new Set(state.isHiddenMaps);
			isHiddenMaps.delete(action.payload.id);

			return { ...state, isLoadingMaps, isHiddenMaps };
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

		case MapActionTypes.VIEW.SET_IS_VISIBLE: {
			const isHiddenMaps = new Set(state.isHiddenMaps);
			const { mapId, isVisible } = action.payload;
			if (!isVisible) {
				isHiddenMaps.add(mapId);
			} else {
				isHiddenMaps.delete(mapId);
			}
			return { ...state, ...action.payload };
		}

		case CoreActionTypes.SET_MAPS_DATA:
			return { ...state, ...action.payload };

		case MapActionTypes.DECREASE_PENDING_MAPS_COUNT:
			const currentCount = state.pendingMapsCount;
			const newCount = currentCount === 0 ? currentCount : currentCount - 1;

			return { ...state, pendingMapsCount: newCount };

		case MapActionTypes.SET_PENDING_OVERLAYS:
			return { ...state, pendingOverlays: action.payload };

		case MapActionTypes.REMOVE_PENDING_OVERLAY:
			const pendingOverlays = state.pendingOverlays.filter((pending) => pending.overlay.id !== action.payload);
			return { ...state, pendingOverlays};

		case CoreActionTypes.TOGGLE_MAP_LAYERS: {
			const mapsList = [ ...state.mapsList ];
			const toggledMap = mapsList.find(map => map.id === action.payload.mapId);
			if (toggledMap) {
				toggledMap.flags.displayLayers = !toggledMap.flags.displayLayers;
			}

			return { ...state, mapsList };
		}

		case CoreActionTypes.SET_LAYOUT:
			const layout = layoutOptions.get(action.payload);
			if ( layout.mapsCount !== state.mapsList.length && state.mapsList.length) {
				const pendingMapsCount = Math.abs(layout.mapsCount - state.mapsList.length);
				const mapsDataChanges = setMapsDataChanges(state.mapsList, state.activeMapId, layout);
				return { ...state, pendingMapsCount, ...mapsDataChanges };
			}
			return state;

		default:
			return state;
	}
}

export const selectActiveMapId = createSelector(mapStateSelector, (map: IMapState) => map.activeMapId);
export const selectMapsList = createSelector(mapStateSelector, (map: IMapState) => map.mapsList);
