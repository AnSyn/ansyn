import { Action } from '@ngrx/store';
import { CaseMapState, MapsLayout, Position } from '@ansyn/core';
import { Overlay } from '@ansyn/core/models/overlay.model';

export const MapActionTypes = {
	POSITION_CHANGED: 'POSITION_CHANGED',
	UPDATE_MAP_SIZE: 'UPDATE_MAP_SIZE',
	ADD_MAP_INSTANCE: 'ADD_MAP_INSTANCE',
	REMOVE_MAP_INSTACNE: 'REMOVE_MAP_INSTACNE',
	STOP_MAP_SHADOW_ACTIONS: 'STOP_MAP_SHADOW_ACTIONS',
	START_MAP_SHADOW_ACTIONS: 'START_MAP_SHADOW_ACTIONS',
	COMPOSITE_MAP_SHADOW_ACTION: 'COMPOSITE_MAP_SHADOW_ACTION',
	MAP_SINGLE_CLICK: 'MAP_SINGLE_CLICK',
	BACK_TO_WORLD: 'BACK_TO_WORLD',
	SET_LOADING_OVERLAYS: 'SET_LOADING_OVERLAYS',
	ADD_OVERLAY_TO_LOADING_OVERLAYS: 'ADD_OVERLAY_TO_LOADING_OVERLAYS',
	REMOVE_OVERLAY_FROM_LOADING_OVERLAYS: 'REMOVE_OVERLAY_FROM_LOADING_OVERLAYS',
	SYNCHRONIZE_MAPS: 'SYNCHRONIZE_MAPS',
	SET_MAP_AUTO_IMAGE_PROCESSING: 'SET_MAP_AUTO_IMAGE_PROCESSING',
	CONTEXT_MENU: {
		SHOW: 'CONTEXT_MENU_SHOW',
		GET_FILTERED_OVERLAYS: 'GET_FILTERED_OVERLAYS',
		DISPLAY: 'DISPLAY'
	},
	VISUALIZERS: {
		HOVER_FEATURE: 'HOVER_FEATURE',
		DBCLICK_FEATURE: 'DBCLICK_FEATURE'
	},
	DRAW_OVERLAY_ON_MAP: 'DRAW_OVERLAY_ON_MAP',
	ENABLE_MAP_GEO_OPTIONS: 'ENABLE_MAP_GEO_OPTIONS',
	MAP_INSTANCE_CHANGED_ACTION: 'MAP_INSTANCE_CHANGED_ACTION',
	SET_LAYOUT: 'SET_LAYOUT',
	SET_OVERLAYS_NOT_IN_CASE: 'SET_OVERLAYS_NOT_IN_CASE',
	SET_FAVORITE: 'SET_FAVORITE',
	STORE: {
		SET_MAPS_DATA: 'SET_MAPS_DATA'
	},
	TRIGGER: {
		ACTIVE_MAP_CHANGED: 'ACTIVE_MAP_CHANGED',
		MAPS_LIST_CHANGED: 'MAPS_LIST_CHANGED',
		PIN_POINT: 'PIN_POINT',
		PIN_POINT_MODE: 'PIN_POINT_MODE',
		PIN_LOCATION_MODE: 'PIN_LOCATION_MODE'
	}
};

export type MapActions = any;

export class EnableMapGeoOptionsActionStore implements Action {
	type = MapActionTypes.ENABLE_MAP_GEO_OPTIONS;

	constructor(public payload: { mapId: string, isEnabled: boolean }) {
	}
}

export class BackToWorldAction implements Action {
	type = MapActionTypes.BACK_TO_WORLD;

	constructor(public payload: { mapId: string } = { mapId: undefined }) {
	}
}

export class ActiveMapChangedAction implements Action {
	type = MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED;

	constructor(public payload: string) {
	}
}

export class PositionChangedAction implements Action {
	type = MapActionTypes.POSITION_CHANGED;

	constructor(public payload: { id: string, position: Position }) {
	}
}

export class UpdateMapSizeAction implements Action {
	type = MapActionTypes.UPDATE_MAP_SIZE;

	constructor(public payload?: any) {
	}
}

export class AddMapInstanceAction implements Action {
	type = MapActionTypes.ADD_MAP_INSTANCE;

	constructor(public payload: { currentCommunicatorId: string, communicatorsIds: string[] }) {
	}
}

// TODO: this is a patch that will be removed when "pinpoint" and "pinLocation" will become plugins
export class MapInstanceChangedAction extends AddMapInstanceAction {
	type = MapActionTypes.MAP_INSTANCE_CHANGED_ACTION;

	constructor(public mapInstanceChangedPayload: { id: string, communicatorsIds: string[], oldMapInstanceName: string, newMapInstanceName: string }) {
		super({
			currentCommunicatorId: mapInstanceChangedPayload.id,
			communicatorsIds: mapInstanceChangedPayload.communicatorsIds
		});
	}
}

export class RemoveMapInstanceAction implements Action {
	type = MapActionTypes.REMOVE_MAP_INSTACNE;

	constructor(public payload: any) {
	}
}

export class StopMapShadowAction implements Action {
	type = MapActionTypes.STOP_MAP_SHADOW_ACTIONS;

	constructor(public payload?: any) {
	}
}

export class StartMapShadowAction implements Action {
	type = MapActionTypes.START_MAP_SHADOW_ACTIONS;

	constructor(public payload?: any) {
	}
}

export class SynchronizeMapsAction implements Action {
	type = MapActionTypes.SYNCHRONIZE_MAPS;

	constructor(public payload: { mapId: string }) {
	}
}

export class CompositeMapShadowAction implements Action {
	type = MapActionTypes.COMPOSITE_MAP_SHADOW_ACTION;

	constructor(public payload?: any) {
	}
}

export class MapSingleClickAction implements Action {
	type = MapActionTypes.MAP_SINGLE_CLICK;

	constructor(public payload: { lonLat: GeoJSON.Position }) {
	}
}

export class PinPointTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.PIN_POINT;

	constructor(public payload: GeoJSON.Position) {
	}
}

export class SetLoadingOverlaysAction implements Action {
	type = MapActionTypes.SET_LOADING_OVERLAYS;

	constructor(public payload: string[]) {
	}
}

export class AddOverlayToLoadingOverlaysAction implements Action {
	type = MapActionTypes.ADD_OVERLAY_TO_LOADING_OVERLAYS;

	constructor(public payload: string) {
	}
}

export class RemoveOverlayFromLoadingOverlaysAction implements Action {
	type = MapActionTypes.REMOVE_OVERLAY_FROM_LOADING_OVERLAYS;

	constructor(public payload: string) {
	}
}

export class SetMapAutoImageProcessing implements Action {
	type = MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING;

	constructor(public payload: { mapId: string, toggle_value: boolean }) {
	}
}

export class ContextMenuShowAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.SHOW;

	constructor(public payload: { point: GeoJSON.Point, e: MouseEvent }) {
	}
}

export class ContextMenuGetFilteredOverlaysAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.GET_FILTERED_OVERLAYS;

	constructor(public payload: Overlay[]) {
	}
}

export class ContextMenuDisplayAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.DISPLAY;

	constructor(public payload: string) {
	}
}

export class HoverFeatureTriggerAction implements Action {
	type = MapActionTypes.VISUALIZERS.HOVER_FEATURE;

	constructor(public payload: { visualizerType: string, id?: string }) {
	}
}

export class DbclickFeatureTriggerAction implements Action {
	type = MapActionTypes.VISUALIZERS.DBCLICK_FEATURE;

	constructor(public payload: { visualizerType: string, id: string }) {
	}
}

export class DrawOverlaysOnMapTriggerAction implements Action {
	type = MapActionTypes.DRAW_OVERLAY_ON_MAP;

	constructor() {
	}
}

export class SetLayoutAction implements Action {
	type = MapActionTypes.SET_LAYOUT;

	constructor(public payload: MapsLayout) {
	}
}

export class SetOverlaysNotInCaseAction implements Action {
	type = MapActionTypes.SET_OVERLAYS_NOT_IN_CASE;

	constructor(public payload: Map<string, boolean>) {
	}
}

export class SetMapsDataActionStore implements Action {
	type = MapActionTypes.STORE.SET_MAPS_DATA;

	constructor(public payload: { mapsList?: CaseMapState[], activeMapId?: string }) {
	}
}

export class PinLocationModeTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.PIN_LOCATION_MODE;

	constructor(public payload: boolean) {
	}
}

export class MapsListChangedAction implements Action {
	type = MapActionTypes.TRIGGER.MAPS_LIST_CHANGED;

	constructor(public payload: CaseMapState[]) {
	}
}

export class PinPointModeTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.PIN_POINT_MODE;

	constructor(public payload: boolean) {
	}
}

export class SetFavoriteAction implements Action {
	type: string = MapActionTypes.SET_FAVORITE;

	constructor(public payload?: string) { // overlayId
	}
}
