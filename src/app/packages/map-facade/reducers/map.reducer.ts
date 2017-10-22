import { MapActions, MapActionTypes } from '../actions/map.actions';
import { cloneDeep } from 'lodash';
import { MapsLayout } from '@ansyn/core/models';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { createFeatureSelector } from '@ngrx/store';

export interface IMapState {
	communicators: {};
	loadingOverlays: string[];
	mapIdToGeoOptions: Map<string, boolean>;
	overlaysNotInCase: Map<string, boolean>;
	layout: MapsLayout;
	activeMapId: string;
	mapsList: CaseMapState[];
}

export const initialMapState: IMapState = {
	communicators: {},
	loadingOverlays: [],
	mapIdToGeoOptions: new Map<string, boolean>(),
	overlaysNotInCase: new Map<string, boolean>(),
	layout: null,
	activeMapId: null,
	mapsList: [],
};

export const mapFeatureKey = 'map';

export const mapStateSelector = createFeatureSelector<IMapState>(mapFeatureKey);

export function MapReducer(state: IMapState = initialMapState, action: MapActions) {

	switch (action.type) {
		case MapActionTypes.ENABLE_MAP_GEO_OPTIONS:
			const mapIdToGeoOptionsClone = new Map(state.mapIdToGeoOptions);
			mapIdToGeoOptionsClone.set(action.payload.mapId, action.payload.isEnabled);
			return { ...state, mapIdToGeoOptions: mapIdToGeoOptionsClone };

		case MapActionTypes.SET_OVERLAYS_NOT_IN_CASE:
			return { ...state, overlaysNotInCase: action.payload };

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

		default:
			return state;
	}
}
