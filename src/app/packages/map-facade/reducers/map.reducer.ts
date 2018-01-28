import { MapActions, MapActionTypes } from '../actions/map.actions';
import { cloneDeep } from 'lodash';
import { MapsLayout } from '@ansyn/core/models';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { CaseRegionState } from '@ansyn/core';

export interface IMapState {
	communicators: {};
	loadingOverlays: string[];
	mapIdToGeoOptions: Map<string, boolean>;
	overlaysNotInCase: Map<string, boolean>;
	layout: MapsLayout;
	activeMapId: string;
	mapsList: CaseMapState[];
	region: any;
	pendingMapsCount: number; // number of maps to be opened
	pendingOverlays: string[]; // a list of overlays waiting for maps to be created in order to be displayed
}

export const initialMapState: IMapState = {
	communicators: {},
	loadingOverlays: [],
	mapIdToGeoOptions: new Map<string, boolean>(),
	overlaysNotInCase: new Map<string, boolean>(),
	layout: null,
	activeMapId: null,
	mapsList: [],
	region: null,
	pendingMapsCount: 0,
	pendingOverlays: []
};

export const mapFeatureKey = 'map';

export const mapStateSelector: MemoizedSelector<any, IMapState> = createFeatureSelector<IMapState>(mapFeatureKey);

export function MapReducer(state: IMapState = initialMapState, action: MapActions | any) {

	switch (action.type) {
		case MapActionTypes.SET_PROGRESS_BAR:
			const progressedMap = state.mapsList.find(map => map.id === action.payload.mapId);
			if (progressedMap) {
				progressedMap.progress = action.payload.progress;
			}
			return state;

		case MapActionTypes.ENABLE_MAP_GEO_OPTIONS:
			const mapIdToGeoOptionsClone = new Map(state.mapIdToGeoOptions);
			mapIdToGeoOptionsClone.set(action.payload.mapId, action.payload.isEnabled);
			return { ...state, mapIdToGeoOptions: mapIdToGeoOptionsClone };

		case MapActionTypes.SET_OVERLAYS_NOT_IN_CASE:
			return { ...state, overlaysNotInCase: action.payload };

		case MapActionTypes.ADD_MAP_INSTANCE:
		case MapActionTypes.REMOVE_MAP_INSTACNE:
			return { ...state, communicators: action.payload.communicatorIds };

		case MapActionTypes.ADD_OVERLAY_TO_LOADING_OVERLAYS:
			const overlayIdToAdd = action.payload.overlayId;
			const isOverlayIdToAddExists = state.loadingOverlays.find((overlay) => overlayIdToAdd === overlay);
			if (!isOverlayIdToAddExists) {
				const loadingOverlays = cloneDeep(state.loadingOverlays);
				loadingOverlays.push(overlayIdToAdd);
				return { ...state, loadingOverlays: loadingOverlays };
			}
			return state;

		case MapActionTypes.REMOVE_OVERLAY_FROM_LOADING_OVERLAYS:
			const overlayIdToRemove = action.payload.overlayId;
			const overlayIndex = state.loadingOverlays.findIndex((overlay) => overlayIdToRemove === overlay);
			if (overlayIndex !== -1) {
				const loadingOverlays = cloneDeep(state.loadingOverlays);
				loadingOverlays.splice(overlayIndex, 1);
				return { ...state, loadingOverlays: loadingOverlays };
			}
			return state;

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

		case  MapActionTypes.SET_REGION:
			return { ...state, region: action.payload };

		default:
			return state;
	}
}
