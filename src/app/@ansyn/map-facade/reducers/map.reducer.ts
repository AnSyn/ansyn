import { IImageryMapPosition, IMapSettings } from '@ansyn/imagery';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { range } from 'lodash';
import { UUID } from 'angular2-uuid';
import { Dictionary } from '@ngrx/entity/src/models';
import { sessionData } from '../models/core-session-state.model';
import { IPendingOverlay, IToastMessage, MapActions, MapActionTypes } from '../actions/map.actions';
import { LayoutKey, layoutOptions } from '../models/maps-layout';

export function setMapsDataChanges(oldEntities: Dictionary<any>, oldActiveMapId, layout): any {
	const mapsList: IMapSettings[] = [];
	const activeMap: IMapSettings = oldEntities[oldActiveMapId];
	const oldMapsList = Object.values(oldEntities);

	range(layout.mapsCount).forEach((index) => {
		if (oldMapsList[index]) {
			mapsList.push(oldMapsList[index]);
		} else {
			const mapStateCopy: IMapSettings = {
				id: UUID.UUID(),
				data: {
					position: {
						extentPolygon: activeMap.data.position.extentPolygon,
						projectedState: activeMap.data.position.projectedState
					}
				},
				worldView: { ...activeMap.worldView },
				orientation: activeMap.orientation,
				flags: {
					hideLayers: false
				}
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

export const mapsAdapter: EntityAdapter<IMapSettings> = createEntityAdapter<IMapSettings>();

export interface IMapState extends EntityState<IMapSettings> {
	activeMapId: string;
	isLoadingMaps: Map<string, string>;
	isHiddenMaps: Set<string>;
	pendingMapsCount: number; // number of maps to be opened
	pendingOverlays: IPendingOverlay[]; // a list of overlays waiting for maps to be created in order to be displayed
	layout: LayoutKey;
	wasWelcomeNotificationShown: boolean;
	toastMessage: IToastMessage;
	footerCollapse: boolean;
	minimalistViewMode: boolean;
}


export const initialMapState: IMapState = mapsAdapter.getInitialState({
	activeMapId: null,
	isLoadingMaps: new Map<string, string>(),
	isHiddenMaps: new Set<string>(),
	pendingMapsCount: 0,
	pendingOverlays: [],
	layout: <LayoutKey>'layout1',
	wasWelcomeNotificationShown: sessionData().wasWelcomeNotificationShown,
	toastMessage: null,
	footerCollapse: false,
	minimalistViewMode: false
});

export const mapFeatureKey = 'map';


export const mapStateSelector: MemoizedSelector<any, IMapState> = createFeatureSelector<IMapState>(mapFeatureKey);

export function MapReducer(state: IMapState = initialMapState, action: MapActions | any) {

	switch (action.type) {
		case MapActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: action.payload };

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

		case MapActionTypes.SET_MAP_ORIENTATION: {
			return mapsAdapter.updateOne({
				id: action.payload.mapId || state.activeMapId,
				changes: {
					orientation: action.payload.orientation
				}
			}, state);
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

		case MapActionTypes.UPDATE_MAP: {
			return mapsAdapter.updateOne(action.payload, state);
		}

		case MapActionTypes.POSITION_CHANGED: {
			const { id, position } = action.payload;
			const entity = state.entities[id];
			if (entity) {
				return mapsAdapter.updateOne({
					id,
					changes: { data: { ...entity.data, position } }
				}, state);
			}
			return state;
		}

		case MapActionTypes.SET_ACTIVE_MAP_ID: {
			return { ...state, activeMapId: action.payload };
		}

		case MapActionTypes.SET_MAPS_DATA:
			return mapsAdapter.addAll(action.payload.mapsList, state);

		case MapActionTypes.DECREASE_PENDING_MAPS_COUNT:
			const currentCount = state.pendingMapsCount;
			const newCount = currentCount === 0 ? currentCount : currentCount - 1;

			return { ...state, pendingMapsCount: newCount };

		case MapActionTypes.SET_PENDING_OVERLAYS:
			return { ...state, pendingOverlays: action.payload };

		case MapActionTypes.REMOVE_PENDING_OVERLAY:
			const pendingOverlays = state.pendingOverlays.filter((pending) => pending.overlay.id !== action.payload);
			return { ...state, pendingOverlays };

		case MapActionTypes.TOGGLE_MAP_LAYERS: {
			const { mapId: id } = action.payload;
			const entity = state.entities[id];
			const flags = { ...entity.flags, hideLayers: !entity.flags.hideLayers };
			return mapsAdapter.updateOne({ id: action.payload.mapId, changes: { flags } }, state);
		}

		case MapActionTypes.SET_LAYOUT:
			const layout = layoutOptions.get(action.payload);
			if (layout.mapsCount !== Object.values(state.entities).length && Object.values(state.entities).length) {
				const pendingMapsCount = Math.abs(layout.mapsCount - Object.values(state.entities).length);
				const mapsList = setMapsDataChanges(state.entities, state.activeMapId, layout);
				return mapsAdapter.addAll(mapsList, { ...state, pendingMapsCount, layout: action.payload });
			}
			return { ...state, layout: action.payload };

		case MapActionTypes.CHANGE_IMAGERY_MAP_SUCCESS: {
			const { id, worldView } = action.payload;
			return mapsAdapter.updateOne({
				id,
				changes: { worldView }
			}, state);
		}

		case MapActionTypes.REPLACE_MAP_MAIN_LAYER_SUCCESS: {
			const { id, sourceType } = action.payload;
			const worldView = { ...state.entities[id].worldView, sourceType };
			return mapsAdapter.updateOne({
				id,
				changes: { worldView }
			}, state)
		}

		case MapActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG:
			return { ...state, wasWelcomeNotificationShown: action.payload };

		case MapActionTypes.FOOTER_COLLAPSE:
			return { ...state, footerCollapse: action.payload };

		case MapActionTypes.SET_MINIMALIST_VIEW_MODE:
			return { ...state, minimalistViewMode: action.payload };

		default:
			return state;
	}
}

const { selectAll, selectEntities, selectIds, selectTotal } = mapsAdapter.getSelectors();
export const selectActiveMapId = createSelector(mapStateSelector, (map: IMapState) => map.activeMapId);
export const selectMapsList = createSelector(mapStateSelector, selectAll);
export const selectMapsTotal = createSelector(mapStateSelector, selectTotal);
export const selectMapsIds = createSelector(mapStateSelector, selectIds);
export const selectMaps = createSelector(mapStateSelector, selectEntities);
export const selectLayout: MemoizedSelector<any, LayoutKey> = createSelector(mapStateSelector, (state) => state.layout);
export const selectWasWelcomeNotificationShown = createSelector(mapStateSelector, (state) => state.wasWelcomeNotificationShown);
export const selectToastMessage = createSelector(mapStateSelector, (state) => state.toastMessage);
export const selectFooterCollapse = createSelector(mapStateSelector, (state) => state.footerCollapse);
export const selectIsMinimalistViewMode = createSelector(mapStateSelector, (state) => state && state.minimalistViewMode);
export const selectOverlaysWithMapIds = createSelector(selectMapsList, selectActiveMapId, (mapsList, activeMapId) => {
	const overlayAndMapId = mapsList.map(map => map.data.overlay ? ({
		overlay: map.data.overlay,
		mapId: map.id,
		isActive: map.id === activeMapId
	}) : ({}));
	return overlayAndMapId;
});
export const selectOverlayOfActiveMap = createSelector(selectMapsList, selectActiveMapId, (mapsList, activeMapId) => {
	const activeMapSettings = mapsList.filter((map: IMapSettings) => map.id === activeMapId);
	return Boolean(activeMapSettings[0]) && activeMapSettings[0].data.overlay;
});
export const selectMapStateById = (id: string) => createSelector(selectMaps, (maps) => maps && maps[id]);
export const selectMapsStateByIds: (mapIds: string[]) => MemoizedSelector<any, IMapSettings[]> = (mapIds: string[]) => createSelector(selectMaps, (maps) => mapIds.map(id => maps[id]));
export const selectOverlayByMapId = (mapId: string) => createSelector(selectMapStateById(mapId), (mapState) => mapState && mapState.data && mapState.data.overlay);
export const selectHideLayersOnMap = (mapId: string) => createSelector(selectMapStateById(mapId), (mapState) => mapState && mapState.flags.hideLayers);
export const selectMapPositionByMapId: (mapId: string) => MemoizedSelector<any, IImageryMapPosition> = (mapId: string) => createSelector(selectMapStateById(mapId), (mapState) => mapState && mapState.data.position);
export const selectMapTypeById: (mapId: string) => MemoizedSelector<any, string> = (mapId => createSelector(selectMapStateById(mapId), (mapState) => mapState && mapState.worldView.mapType));
export const selectSourceTypeById: (mapId: string) => MemoizedSelector<any, string> = (mapId => createSelector(selectMapStateById(mapId), (mapState) => mapState && mapState.worldView.sourceType));

export const selectOverlayDisplayModeByMapId: (mapId: string) => MemoizedSelector<any, any> = (mapId: string) => createSelector(selectMapStateById(mapId), (mapState) => mapState && mapState.data && mapState.data.overlayDisplayMode);
export const selectMapOrientation = (mapId: string) => createSelector(selectMapStateById(mapId) , (mapState) => mapState && mapState.orientation);
