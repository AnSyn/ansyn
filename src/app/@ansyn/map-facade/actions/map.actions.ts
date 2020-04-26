import { Action } from '@ngrx/store';
import { Point, Polygon, Position } from 'geojson';
import {
	ImageryMapPosition,
	IMapInstanceChanged,
	IMapProgress,
	IMapSettings,
	IWorldViewMapState
} from '@ansyn/imagery';
import { LayoutKey } from '../models/maps-layout';
import { MapOrientation } from "@ansyn/imagery";

export interface IAngleFilterClick { // @TODO: map-facade should not know IOverlay
	click: { x: number, y: number };
	overlays: any[];
	displayedOverlay: any;
	point: Point;

}

export interface IPendingOverlay { // @TODO: map-facade should not know IOverlay
	overlay: any;
	extent?: any;
}

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export const MapActionTypes = {
	POINT_TO_IMAGE_ORIENTATION: 'POINT_TO_IMAGE_ORIENTATION',
	POINT_TO_REAL_NORTH: 'POINT_TO_REAL_NORTH',
	POSITION_CHANGED: 'POSITION_CHANGED',
	UPDATE_MAP_SIZE: 'UPDATE_MAP_SIZE',
	IMAGERY_CREATED: 'IMAGERY_CREATED',
	IMAGERY_REMOVED: 'IMAGERY_REMOVED',
	SYNCHRONIZE_MAPS: 'SYNCHRONIZE_MAPS',
	SET_MAP_AUTO_IMAGE_PROCESSING: 'SET_MAP_AUTO_IMAGE_PROCESSING',
	SET_MAP_MANUAL_IMAGE_PROCESSING: 'SET_MAP_MANUAL_IMAGE_PROCESSING',
	CONTEXT_MENU: {
		SHOW: 'CONTEXT_MENU_SHOW',
		DISPLAY: 'CONTEXT_MENU_DISPLAY',
		ANGLE_FILTER_SHOW: 'ANGLE_FILTER_SHOW'
	},
	VISUALIZERS: {
		HOVER_FEATURE: 'HOVER_FEATURE'
	},
	MAP_INSTANCE_CHANGED_ACTION: 'MAP_INSTANCE_CHANGED_ACTION',
	VIEW: {
		SET_IS_LOADING: 'SET_IS_LOADING',
		SET_IS_VISIBLE: 'SET_IS_VISIBLE',
		SET_PROGRESS_BAR: 'SET_PROGRESS_BAR'
	},
	TRIGGER: {
		IMAGERY_MOUSE_ENTER: 'IMAGERY_MOUSE_ENTER',
		IMAGERY_MOUSE_LEAVE: 'IMAGERY_MOUSE_LEAVE',
		ACTIVE_IMAGERY_MOUSE_ENTER: 'ACTIVE_IMAGERY_MOUSE_ENTER',
		ACTIVE_IMAGERY_MOUSE_LEAVE: 'ACTIVE_IMAGERY_MOUSE_LEAVE',
		CONTEXT_MENU: 'CONTEXT_MENU',
		PIN_LOCATION_MODE: 'PIN_LOCATION_MODE',
		CLICK_OUTSIDE_MAP: 'CLICK_OUTSIDE_MAP'
	},
	SET_PENDING_MAPS_COUNT: 'SET_PENDING_MAPS_COUNT',
	DECREASE_PENDING_MAPS_COUNT: 'DECREASE_PENDING_MAPS_COUNT',
	SET_PENDING_OVERLAYS: 'SET_PENDING_OVERLAYS',
	SET_MAP_ORIENTATION: 'SET_IMAGE_OPENING_ORIENTATION',
	REMOVE_PENDING_OVERLAY: 'REMOVE_PENDING_OVERLAY',
	SHADOW_MOUSE_PRODUCER: 'SHADOW_MOUSE_PRODUCER',
	SET_MAPS_DATA: 'SET_MAPS_DATA',
	SET_ACTIVE_MAP_ID: 'SET_ACTIVE_MAP_ID',
	UPDATE_MAP: 'UPDATE_MAP',
	CHANGE_IMAGERY_MAP: '[Maps] CHANGE_IMAGERY_MAP',
	CHANGE_IMAGERY_MAP_SUCCESS: '[Maps] CHANGE_IMAGERY_MAP_SUCCESS',
	CHANGE_IMAGERY_MAP_FAILED: '[Maps] CHANGE_IMAGERY_MAP_FAILED',
	SET_MAP_POSITION_BY_RECT: '[Maps] SET_MAP_POSITION_BY_RECT',
	SET_MAP_POSITION_BY_RADIUS: '[Maps] SET_MAP_POSITION_BY_RADIUS',
	SET_LAYOUT: 'SET_LAYOUT',
	SET_LAYOUT_SUCCESS: 'SET_LAYOUT_SUCCESS',
	TOGGLE_MAP_LAYERS: 'TOGGLE_MAP_LAYERS',
	SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG: 'SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG',
	SET_TOAST_MESSAGE: 'SET_TOAST_MESSAGE',
	FOOTER_COLLAPSE: 'FOOTER_COLLAPSE',
	EXPORT_MAPS_TO_PNG_REQUEST: 'EXPORT_MAPS_TO_PNG_REQUEST',
	EXPORT_MAPS_TO_PNG_SUCCESS: 'EXPORT_MAPS_TO_PNG_SUCCESS',
	EXPORT_MAPS_TO_PNG_FAILED: 'EXPORT_MAPS_TO_PNG_FAILED',
	SET_MINIMALIST_VIEW_MODE: '[Maps] Set Minimalist View Mode',
	REPLACE_MAP_MAIN_LAYER: '[Maps] replace Main Layer',
	REPLACE_MAP_MAIN_LAYER_SUCCESS: '[Maps] replace Main Layer success',
	REPLACE_MAP_MAIN_LAYER_FAILED: '[Maps] replace Main Layer failed'
};

export interface IContextMenuShowPayload {
	point: Point;
	overlays: any[];
	event: MouseEvent;
}

export type MapActions = any;

export class ExportMapsToPngActionFailed implements Action {
	readonly type = MapActionTypes.EXPORT_MAPS_TO_PNG_FAILED;

	constructor(error: any) {
	}
}

export class SetMinimalistViewModeAction implements Action {
	type = MapActionTypes.SET_MINIMALIST_VIEW_MODE;

	constructor(public payload: boolean) {
	}
}

export class SetMapOrientation implements Action {
	type = MapActionTypes.SET_MAP_ORIENTATION;
	constructor(public payload: MapOrientation) {
	}
}

export class ExportMapsToPngRequestedAction implements Action {
	readonly type = MapActionTypes.EXPORT_MAPS_TO_PNG_REQUEST;

	constructor() {
	}
}

export class ExportMapsToPngActionSuccess implements Action {
	readonly type = MapActionTypes.EXPORT_MAPS_TO_PNG_SUCCESS;

	constructor() {
	}
}

export class SetProgressBarAction implements Action {
	readonly type = MapActionTypes.VIEW.SET_PROGRESS_BAR;

	constructor(public payload: IMapProgress) {
	}
}

export class PointToRealNorthAction implements Action {
	type = MapActionTypes.POINT_TO_REAL_NORTH;

	constructor(public payload: string) {
	}
}

export class PointToImageOrientationAction implements Action {
	type = MapActionTypes.POINT_TO_IMAGE_ORIENTATION;

	// todo: remove overlay from mapFacade
	constructor(public payload: { mapId: string, overlay: any }) {
	}
}

export class PositionChangedAction implements Action {
	type = MapActionTypes.POSITION_CHANGED;

	constructor(public payload: { id: string, position: ImageryMapPosition, mapInstance: IMapSettings }) {
	}
}

export class UpdateMapSizeAction implements Action {
	type = MapActionTypes.UPDATE_MAP_SIZE;

	constructor() {
	}
}

export class ImageryCreatedAction implements Action {
	type = MapActionTypes.IMAGERY_CREATED;

	constructor(public payload: { id: string }) {
	}
}

export class ImageryRemovedAction implements Action {
	type = MapActionTypes.IMAGERY_REMOVED;

	constructor(public payload: { id: string }) {
	}
}

export class MapInstanceChangedAction implements Action {
	type = MapActionTypes.MAP_INSTANCE_CHANGED_ACTION;

	constructor(public payload: IMapInstanceChanged) {
	}
}

export class SynchronizeMapsAction implements Action {
	type = MapActionTypes.SYNCHRONIZE_MAPS;

	constructor(public payload: { mapId: string }) {
	}
}

export class ContextMenuTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.CONTEXT_MENU;

	constructor(public payload: Position) {
	}
}

export class ContextMenuShowAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.SHOW;

	constructor(public payload: IContextMenuShowPayload) {
	}
}

export class ContextMenuDisplayAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.DISPLAY;

	constructor(public payload: string) {
	}
}

export class ContextMenuShowAngleFilter implements Action {
	type = MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW;

	constructor(public payload: IAngleFilterClick) {
	}
}

export class PinLocationModeTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.PIN_LOCATION_MODE;

	constructor(public payload: boolean) {
	}
}

export class DecreasePendingMapsCountAction implements Action {
	type: string = MapActionTypes.DECREASE_PENDING_MAPS_COUNT;

	constructor() {
	}
}

export class SetPendingOverlaysAction implements Action {
	type: string = MapActionTypes.SET_PENDING_OVERLAYS;

	constructor(public payload: IPendingOverlay[]) {
	}
}

export class RemovePendingOverlayAction implements Action {
	type: string = MapActionTypes.REMOVE_PENDING_OVERLAY;

	constructor(public payload: string) {
	}
}

export class ActiveImageryMouseEnter implements Action {
	type = MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_ENTER;
}

export class ActiveImageryMouseLeave implements Action {
	type = MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_LEAVE;
}

export class SetIsLoadingAcion implements Action {
	type = MapActionTypes.VIEW.SET_IS_LOADING;

	constructor(public payload: { mapId: string, show: boolean, text?: string }) {

	}
}

export class SetIsVisibleAcion implements Action {
	type = MapActionTypes.VIEW.SET_IS_VISIBLE;

	constructor(public payload: { mapId: string, isVisible: boolean }) {

	}
}

export class ClickOutsideMap implements Action {
	readonly type = MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP;

	constructor(public payload: any) {
	}
}

export class ShadowMouseProducer implements Action {
	readonly type = MapActionTypes.SHADOW_MOUSE_PRODUCER;

	constructor(public payload: { point: { coordinates: Position, type: string }, outsideSource?: boolean }) {

	}
}

export class ImageryMouseEnter implements Action {
	type = MapActionTypes.TRIGGER.IMAGERY_MOUSE_ENTER;

	constructor(public payload: string) {
	}
}

export class ImageryMouseLeave implements Action {
	type = MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE;

	constructor(public payload: string) {
	}
}

export class ChangeImageryMap implements Action {
	readonly type = MapActionTypes.CHANGE_IMAGERY_MAP;

	constructor(public payload: { id: string, mapType: string, sourceType?: string }) {
	}
}

export class ChangeImageryMapSuccess implements Action {
	readonly type = MapActionTypes.CHANGE_IMAGERY_MAP_SUCCESS;

	constructor(public payload: { id: string, worldView: IWorldViewMapState }) {
	}
}

export class ChangeImageryMapFailed implements Action {
	readonly type = MapActionTypes.CHANGE_IMAGERY_MAP_FAILED;

	constructor(public payload: { id: string, error: any }) {
	}
}

export class ReplaceMainLayer implements Action {
	readonly type = MapActionTypes.REPLACE_MAP_MAIN_LAYER;
	constructor( public payload: { id: string, sourceType: string }) { }
}

export class ReplaceMainLayerSuccess implements Action {
	readonly type = MapActionTypes.REPLACE_MAP_MAIN_LAYER_SUCCESS;
	constructor( public payload: { id: string, sourceType: string }) { }
}

export class ReplaceMainLayerFailed implements Action {
	readonly type = MapActionTypes.REPLACE_MAP_MAIN_LAYER_FAILED;

}


export class SetMapsDataActionStore implements Action {
	type = MapActionTypes.SET_MAPS_DATA;

	constructor(public payload: { mapsList: IMapSettings[] }) {
	}
}

export class SetActiveMapId implements Action {
	type = MapActionTypes.SET_ACTIVE_MAP_ID;

	constructor(public payload: string) {
	}
}

export class UpdateMapAction implements Action {
	type = MapActionTypes.UPDATE_MAP;

	constructor(public payload: { id: string, changes?: Partial<IMapSettings>, silence?: boolean, }) {
	}
}

export class SetMapPositionByRectAction implements Action {
	type = MapActionTypes.SET_MAP_POSITION_BY_RECT;

	constructor(public payload: { id: string; rect: Polygon }) {
	}
}

export class SetMapPositionByRadiusAction implements Action {
	type = MapActionTypes.SET_MAP_POSITION_BY_RADIUS;

	constructor(public payload: { id: string; center: Point; radiusInMeters: number }) {
	}
}

export class SetLayoutAction implements Action {
	type = MapActionTypes.SET_LAYOUT;

	constructor(public payload: LayoutKey) {
	}
}

export class SetLayoutSuccessAction implements Action {
	type = MapActionTypes.SET_LAYOUT_SUCCESS;

	constructor() {
	}
}

export class ToggleMapLayersAction implements Action {
	type = MapActionTypes.TOGGLE_MAP_LAYERS;

	constructor(public payload: { mapId: string, isVisible: boolean }) {
	}
}

export class SetWasWelcomeNotificationShownFlagAction implements Action {
	type = MapActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG;

	constructor(public payload: boolean) {

	}
}

export class SetToastMessageAction implements Action {
	type = MapActionTypes.SET_TOAST_MESSAGE;

	constructor(public payload?: IToastMessage) {
	}
}

export class ToggleFooter implements Action {
	type = MapActionTypes.FOOTER_COLLAPSE;

	constructor(public payload: boolean) {
	}
}
