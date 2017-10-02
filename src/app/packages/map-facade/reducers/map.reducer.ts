import { MapActions, MapActionTypes } from '../actions/map.actions';
import { Position } from '@ansyn/core';
import { cloneDeep } from 'lodash';
import { MapsLayout } from '@ansyn/core/models';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { Overlay } from '../../core/models/overlay.model';

export interface IMapState {
	positions: Position;
	communicators: {};
	loadingOverlays: string[];
	filteredOverlays: Overlay[];
	displayedOverlay: Overlay;
	mapIdToGeoOptions: Map<string, boolean>;
	overlaysNotInCase: Map<string, boolean>;
	layout: MapsLayout;
	activeMapId: string;
	mapsList: CaseMapState[];
}

export const initialMapState: IMapState = {
	positions: {} as any,
	communicators: {},
	loadingOverlays: [],
	filteredOverlays: [],
	displayedOverlay: null,
	mapIdToGeoOptions: new Map<string, boolean>(),
	overlaysNotInCase: new Map<string, boolean>(),
	layout: null,
	activeMapId: null,
	mapsList: [],
};

export function MapReducer(state: IMapState = initialMapState, action: MapActions) {

	switch (action.type) {
		case MapActionTypes.ENABLE_MAP_GEO_OPTIONS:
			const mapIdToGeoOptionsClone = new Map(state.mapIdToGeoOptions);
			mapIdToGeoOptionsClone.set(action.payload.mapId, action.payload.isEnabled);
			return { ...state, mapIdToGeoOptions: mapIdToGeoOptionsClone };

		case MapActionTypes.SET_OVERLAYS_NOT_IN_CASE:
			return { ...state, overlaysNotInCase: action.payload };

		case MapActionTypes.POSITION_CHANGED:
			const positions = cloneDeep(state.positions);
			positions[action.payload.id] = action.payload.position;
			return { ...state, positions: positions };

		case MapActionTypes.ADD_MAP_INSTANCE:
		case MapActionTypes.REMOVE_MAP_INSTACNE:
			return { ...state, communicators: action.payload.communicatorsIds };

		case MapActionTypes.SET_LOADING_OVERLAYS:
			return { ...state, loadingOverlays: action.payload };

		case MapActionTypes.ADD_OVERLAY_TO_LOADING_OVERLAYS:
			const overlayIdToAdd = action.payload.overlayId;
			const isOverlayIdToAddExists = state.loadingOverlays.find((overlay) => overlayIdToAdd === overlay);
			if (!isOverlayIdToAddExists) {
				const loadingOverlays = cloneDeep(state.loadingOverlays);
				loadingOverlays.push(overlayIdToAdd);
				return { ...state, loadingOverlays: loadingOverlays };
			}
			break;

		case MapActionTypes.REMOVE_OVERLAY_FROM_LOADING_OVERLAYS:
			const overlayIdToRemove = action.payload.overlayId;
			const overlayIndex = state.loadingOverlays.findIndex((overlay) => overlayIdToRemove === overlay);
			if (overlayIndex !== -1) {
				const loadingOverlays = cloneDeep(state.loadingOverlays);
				loadingOverlays.splice(overlayIndex, 1);
				return { ...state, loadingOverlays: loadingOverlays };
			}
			break;

		case MapActionTypes.CONTEXT_MENU.SET_FILTERED_OVERLAYS:
			return { ...state, ...action.payload };

		case MapActionTypes.SET_LAYOUT:
			return { ...state, layout: action.payload };

		case MapActionTypes.STORE.SET_MAPS_DATA:
			return { ...state, ...action.payload };

		default:
			return state;
	}
}
