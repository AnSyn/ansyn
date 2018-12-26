import { MapActions, MapActionTypes } from '../actions/map.actions';
import { CoreActionTypes, ICaseMapState, IPendingOverlay, layoutOptions } from '@ansyn/core';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { range } from 'lodash';
import { UUID } from 'angular2-uuid';
import { Dictionary } from '@ngrx/entity/src/models';

export function setMapsDataChanges(oldEntities: Dictionary<any>, oldActiveMapId, layout): any {
	const mapsList: ICaseMapState[] = [];
	const activeMap: ICaseMapState = oldEntities[oldActiveMapId];
	const oldMapsList = Object.values(oldEntities);

	range(layout.mapsCount).forEach((index) => {
		if (oldMapsList[index]) {
			mapsList.push(oldMapsList[index]);
		} else {
			const mapStateCopy: ICaseMapState = {
				id: UUID.UUID(),
				data: { position: null },
				worldView: { ...activeMap.worldView },
				flags: {}
			};
			mapsList.push(mapStateCopy);
		}
	});

	/* activeMapId */
	const notExist = !mapsList.some(({ id }) => id === oldActiveMapId);
	if (notExist) {
		mapsList[mapsList.length - 1] = activeMap;
	}

	return mapsList;
}

export const mapsAdapter: EntityAdapter<ICaseMapState> = createEntityAdapter<ICaseMapState>();

export interface IMapState extends EntityState<ICaseMapState> {
	activeMapId: string;
	isLoadingMaps: Map<string, string>,
	isHiddenMaps: Set<string>,
	pendingMapsCount: number; // number of maps to be opened
	pendingOverlays: IPendingOverlay[]; // a list of overlays waiting for maps to be created in order to be displayed
}


export const initialMapState: IMapState = mapsAdapter.getInitialState({
	activeMapId: null,
	isLoadingMaps: new Map<string, string>(),
	isHiddenMaps: new Set<string>(),
	pendingMapsCount: 0,
	pendingOverlays: []
});

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
			const exist = state.entities[mapId];
			if (show && exist) {
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

		case CoreActionTypes.UPDATE_MAP: {
			return mapsAdapter.updateOne(action.payload, state);
		}

		case MapActionTypes.POSITION_CHANGED: {
			const { id, position } = action.payload;
			state.entities[id].data.position = position;
			return { ...state, entities: { ...state.entities } }
		}

		case CoreActionTypes.SET_MAPS_DATA:
			const activeMapId = action.payload.activeMapId || state.activeMapId;
			const updatedState = { ...state, activeMapId };
			if (Array.isArray(action.payload.mapsList)) {
				return mapsAdapter.addAll(action.payload.mapsList, updatedState);
			}
			return updatedState;

		case MapActionTypes.DECREASE_PENDING_MAPS_COUNT:
			const currentCount = state.pendingMapsCount;
			const newCount = currentCount === 0 ? currentCount : currentCount - 1;

			return { ...state, pendingMapsCount: newCount };

		case MapActionTypes.SET_PENDING_OVERLAYS:
			return { ...state, pendingOverlays: action.payload };

		case MapActionTypes.REMOVE_PENDING_OVERLAY:
			const pendingOverlays = state.pendingOverlays.filter((pending) => pending.overlay.id !== action.payload);
			return { ...state, pendingOverlays };

		case CoreActionTypes.TOGGLE_MAP_LAYERS: {
			const entities = { ...state.entities };
			const toggledMap = entities[action.payload.mapId];
			if (toggledMap) {
				toggledMap.flags.displayLayers = !toggledMap.flags.displayLayers;
			}

			return { ...state, entities };
		}

		case CoreActionTypes.SET_LAYOUT:
			const layout = layoutOptions.get(action.payload);
			if (layout.mapsCount !== Object.values(state.entities).length && Object.values(state.entities).length) {
				const pendingMapsCount = Math.abs(layout.mapsCount - Object.values(state.entities).length);
				const mapsList = setMapsDataChanges(state.entities, state.activeMapId, layout);
				return mapsAdapter.addAll(mapsList, { ...state, pendingMapsCount });
			}
			return state;

		default:
			return state;
	}
}
const { selectAll, selectEntities } = mapsAdapter.getSelectors();
export const selectActiveMapId = createSelector(mapStateSelector, (map: IMapState) => map.activeMapId);
export const selectMapsList = createSelector(mapStateSelector, selectAll);
export const selectMaps = createSelector(mapStateSelector, selectEntities);
