import { Action, createAction, props } from '@ngrx/store';
import { Point, Polygon, Position } from 'geojson';
import {
	ImageryMapPosition,
	IMapInstanceChanged,
	IMapProgress,
	IMapSettings,
	IWorldViewMapState
} from '@ansyn/imagery';
import { LayoutKey } from '../models/maps-layout';

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
	EXPORT_MAPS_TO_PNG_SUCCESS: 'EXPORT_MAPS_TO_PNG_SUCCESS',
	EXPORT_MAPS_TO_PNG_FAILED: 'EXPORT_MAPS_TO_PNG_FAILED',
	SET_MINIMALIST_VIEW_MODE: '[Maps] Set Minimalist View Mode',
};

export interface IContextMenuShowPayload {
	point: Point;
	overlays: any[];
	event: MouseEvent;
}

export type MapActions = any;

export const ExportMapsToPngActionFailed = createAction(
											MapActionTypes.EXPORT_MAPS_TO_PNG_FAILED,
											props<{error: any}>()
);

export const SetMinimalistViewModeAction = createAction(
											MapActionTypes.SET_MINIMALIST_VIEW_MODE,
											props<{payload: boolean}>()
											);

export const ExportMapsToPngActionSuccess = createAction(
											MapActionTypes.EXPORT_MAPS_TO_PNG_SUCCESS
											);

export const SetProgressBarAction = createAction(
									MapActionTypes.VIEW.SET_PROGRESS_BAR,
									props<IMapProgress>()
									);

export const PointToRealNorthAction = createAction(
										MapActionTypes.POINT_TO_REAL_NORTH,
										props<{mapId: string}>()
										);

export const PositionChangedAction = createAction(
									MapActionTypes.POSITION_CHANGED,
									props<{ id: string, position: ImageryMapPosition, mapInstance: IMapSettings }>()
);

export const UpdateMapSizeAction = createAction(
									MapActionTypes.UPDATE_MAP_SIZE
									);

export const ImageryCreatedAction = createAction(
									MapActionTypes.IMAGERY_CREATED,
									props<{ id: string }>()
									);

export const ImageryRemovedAction = createAction(
									MapActionTypes.IMAGERY_REMOVED,
									props<{payload: string}>()
									);

export const MapInstanceChangedAction = createAction(
										MapActionTypes.MAP_INSTANCE_CHANGED_ACTION,
										props<IMapInstanceChanged>()
										);

export const SynchronizeMapsAction = createAction(
										MapActionTypes.SYNCHRONIZE_MAPS,
										props<{mapId: string}>()
										);

export const ContextMenuTriggerAction = createAction(
										MapActionTypes.TRIGGER.CONTEXT_MENU,
										props<{payload: Position}>()
										);

export const ContextMenuShowAction = createAction(
										MapActionTypes.CONTEXT_MENU.SHOW,
										props<IContextMenuShowPayload>()
										);

export const ContextMenuDisplayAction = createAction(
										MapActionTypes.CONTEXT_MENU.DISPLAY,
										props<{payload: string}>()
										);

export const ContextMenuShowAngleFilter = createAction(
											MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW,
											props<IAngleFilterClick>()
											);

export const PinLocationModeTriggerAction = createAction(
											MapActionTypes.TRIGGER.PIN_LOCATION_MODE,
											props<Boolean>()
											);

export const DecreasePendingMapsCountAction = createAction(
												MapActionTypes.DECREASE_PENDING_MAPS_COUNT
												);

export const SetPendingOverlaysAction = createAction(
										MapActionTypes.SET_PENDING_OVERLAYS,
										props<{payload: IPendingOverlay[]}>()
										);

export const RemovePendingOverlayAction = createAction(
										MapActionTypes.REMOVE_PENDING_OVERLAY,
										props<String>()
										);

export const ActiveImageryMouseEnter = createAction(
										MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_ENTER
										);

export const ActiveImageryMouseLeave = createAction(
										MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_LEAVE
										);

export const SetIsLoadingAcion = createAction(
									MapActionTypes.VIEW.SET_IS_LOADING,
									props<{ mapId: string, show: boolean, text?: string }>()
								);

export const SetIsVisibleAcion = createAction(
									MapActionTypes.VIEW.SET_IS_VISIBLE,
									props<{ mapId: string, isVisible: boolean }>()
								);

export const ClickOutsideMap = createAction(
								MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP,
								props<{ payload: any}>()
								);

export const ShadowMouseProducer = createAction(
									MapActionTypes.SHADOW_MOUSE_PRODUCER,
									props<{ point: { coordinates: Position, type: string }, outsideSource?: boolean }>()
									);

export const ImageryMouseEnter = createAction(
								MapActionTypes.TRIGGER.IMAGERY_MOUSE_ENTER,
								props<{payload: string}>()
								);

export const ImageryMouseLeave = createAction(
								MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE,
								props<{payload: string}>()
								);

export const ChangeImageryMap = createAction(
								MapActionTypes.CHANGE_IMAGERY_MAP,
								props<{ id: string, mapType: string, sourceType?: string }>()
								);

export const ChangeImageryMapSuccess = createAction(
										MapActionTypes.CHANGE_IMAGERY_MAP_SUCCESS,
										props<{ id: string, worldView: IWorldViewMapState }>()
										);

export const ChangeImageryMapFailed = createAction(
										MapActionTypes.CHANGE_IMAGERY_MAP_FAILED,
										props<{ id: string, error: any}>()
									);

export const SetMapsDataActionStore = createAction(
										MapActionTypes.SET_MAPS_DATA,
										props<{ mapsList: IMapSettings[] }>()
);

export const SetActiveMapId = createAction(
								MapActionTypes.SET_ACTIVE_MAP_ID,
								props<String>()
							);

export const UpdateMapAction = createAction(
								MapActionTypes.UPDATE_MAP,
								props<{ id: string, changes?: Partial<IMapSettings>, silence?: boolean, }>()
								);

export const SetMapPositionByRectAction = createAction(
											MapActionTypes.SET_MAP_POSITION_BY_RECT,
											props<{ id: string; rect: Polygon }>()
										);

export const SetMapPositionByRadiusAction = createAction(
											MapActionTypes.SET_MAP_POSITION_BY_RADIUS,
											props<{ id: string; center: Point; radiusInMeters: number }>()
											);

export const SetLayoutAction = createAction(
								MapActionTypes.SET_LAYOUT,
								props<{ key: LayoutKey}>()
								);

export const SetLayoutSuccessAction = createAction(
										MapActionTypes.SET_LAYOUT_SUCCESS
										);

export const ToggleMapLayersAction = createAction(
										MapActionTypes.TOGGLE_MAP_LAYERS,
										props<{ mapId: string, isVisible: boolean}>()
										);

export const SetWasWelcomeNotificationShownFlagAction = createAction(
													MapActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG,
													props<Boolean>()
													);

export const SetToastMessageAction = createAction(
									MapActionTypes.SET_TOAST_MESSAGE,
									props<IToastMessage>()
									);

export const ToggleFooter = createAction(
							MapActionTypes.FOOTER_COLLAPSE,
							props<{payload: boolean}>()
							);
