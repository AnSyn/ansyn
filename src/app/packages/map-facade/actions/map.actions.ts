import { Action } from '@ngrx/store';
import { Position } from '@ansyn/core';

export const MapActionTypes = {
	POSITION_CHANGED: 'POSITION_CHANGED',
	UPDATE_MAP_SIZE: 'UPDATE_MAP_SIZE',
	ADD_MAP_INSTANCE: 'ADD_MAP_INSTANCE',
	REMOVE_MAP_INSTACNE: 'REMOVE_MAP_INSTACNE',
	STOP_MAP_SHADOW_ACTIONS: 'STOP_MAP_SHADOW_ACTIONS',
	START_MAP_SHADOW_ACTIONS: 'START_MAP_SHADOW_ACTIONS',
	COMPOSITE_MAP_SHADOW_ACTION: 'COMPOSITE_MAP_SHADOW_ACTION',
	ACTIVE_MAP_CHANGED: 'ACTIVE_MAP_CHANGED',
	MAP_SINGLE_CLICK: 'MAP_SINGLE_CLICK',
	BACK_TO_WORLD: 'BACK_TO_WORLD',
	SET_LOADING_OVERLAYS: 'SET_LOADING_OVERLAYS',
	ADD_OVERLAY_TO_LOADING_OVERLAYS: 'ADD_OVERLAY_TO_LOADING_OVERLAYS',
	REMOVE_OVERLAY_FROM_LOADING_OVERLAYS: 'REMOVE_OVERLAY_FROM_LOADING_OVERLAYS',
	SYNCHRONIZE_MAPS: 'SYNCHRONIZE_MAPS',
	SET_MAP_AUTO_IMAGE_PROCESSING: 'SET_MAP_AUTO_IMAGE_PROCESSING',
	CONTEXT_MENU: {
		SHOW: 'CONTEXT_MENU_SHOW',
		SET_FILTERED_OVERLAYS: 'SET_FILTERED_OVERLAYS',
		DISPLAY: 'DISPLAY'
	},
	VISUALIZERS: {
		HOVER_FEATURE: 'HOVER_FEATURE',
		DBCLICK_FEATURE: 'DBCLICK_FEATURE'
	},
	DRAW_OVERLAY_ON_MAP: 'DRAW_OVERLAY_ON_MAP'
};

export type MapActions = any;

export class BackToWorldAction implements Action {
	type = MapActionTypes.BACK_TO_WORLD;
	constructor(public payload: {mapId: string} = {mapId: undefined}) {
		// code...
	}
}

export class ActiveMapChangedAction implements Action {
	type = MapActionTypes.ACTIVE_MAP_CHANGED;
	constructor(public payload?: any) {
		// code...
	}
}

export class PositionChangedAction implements Action{
	type = MapActionTypes.POSITION_CHANGED;
	constructor	(public payload: {id: string, position: Position}) {}
}

export class UpdateMapSizeAction implements Action{
	type = MapActionTypes.UPDATE_MAP_SIZE;
	constructor	(public payload?: any) {}
}

export class AddMapInstacneAction implements Action{
	type = MapActionTypes.ADD_MAP_INSTANCE;
	constructor(public payload: any) {}
}

export class RemoveMapInstanceAction implements Action{
	type = MapActionTypes.REMOVE_MAP_INSTACNE;
	constructor(public payload: any) {}
}

export class StopMapShadowAction implements Action{
	type = MapActionTypes.STOP_MAP_SHADOW_ACTIONS;
	constructor	(public payload?: any) {}
}

export class StartMapShadowAction implements Action{
	type = MapActionTypes.START_MAP_SHADOW_ACTIONS;
	constructor(public payload?: any) {}
}

export class SynchronizeMapsAction implements Action{
	type = MapActionTypes.SYNCHRONIZE_MAPS;
	constructor(public payload: {mapId: string}) {}
}

export class CompositeMapShadowAction implements Action {
	type = MapActionTypes.COMPOSITE_MAP_SHADOW_ACTION;
	constructor(public payload?: any) {}
}

export class MapSingleClickAction implements Action {
	type = MapActionTypes.MAP_SINGLE_CLICK;
	constructor(public payload: any){}
}

export class SetLoadingOverlaysAction implements Action {
	type = MapActionTypes.SET_LOADING_OVERLAYS;
	constructor(public payload: string[]){}
}

export class AddOverlayToLoadingOverlaysAction implements Action {
	type = MapActionTypes.ADD_OVERLAY_TO_LOADING_OVERLAYS;
	constructor(public payload: string){}
}

export class RemoveOverlayFromLoadingOverlaysAction implements Action {
	type = MapActionTypes.REMOVE_OVERLAY_FROM_LOADING_OVERLAYS;
	constructor(public payload: string){}
}

export class SetMapAutoImageProcessing implements Action {
	type = MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING;
	constructor(public payload: { mapId: string, toggle_value: boolean }) { }
}

export class ContextMenuShowAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.SHOW;
	constructor(public payload: any){}
}
export class SetContextMenuFiltersAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.SET_FILTERED_OVERLAYS;
	constructor(public payload: {filteredOverlays: any[], displayedOverlay: any}){}
}
export class ContextMenuDisplayAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.DISPLAY;
	constructor(public payload: string){}
}
export class HoverFeatureChangedTriggerAction implements Action {
	type = MapActionTypes.VISUALIZERS.HOVER_FEATURE;
	constructor(public payload?: string){}
}
export class dbclickFeatureTriggerAction implements Action {
	type = MapActionTypes.VISUALIZERS.DBCLICK_FEATURE;
	constructor(public payload: string){}
}
export class DrawOverlaysOnMapTriggerAction implements Action {
	type = MapActionTypes.DRAW_OVERLAY_ON_MAP;
	constructor(){}
}
