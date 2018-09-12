import { Action } from '@ngrx/store';
import { Point, Position } from 'geojson';
import { IImageryChanged } from '@ansyn/imagery';
import { IMapInstanceChanged } from '@ansyn/imagery';
import { ICaseMapPosition } from '@ansyn/core';
import { ICaseMapState } from '@ansyn/core';
import { IOverlay, IPendingOverlay } from '@ansyn/core';
import { IAnnotationsSelectionEventData, IUpdateFeatureEvent } from '@ansyn/core';

export const MapActionTypes = {
	POSITION_CHANGED: 'POSITION_CHANGED',
	UPDATE_MAP_SIZE: 'UPDATE_MAP_SIZE',
	IMAGERY_CREATED: 'IMAGERY_CREATED',
	IMAGERY_REMOVED: 'IMAGERY_REMOVED',
	SYNCHRONIZE_MAPS: 'SYNCHRONIZE_MAPS',
	SET_MAP_AUTO_IMAGE_PROCESSING: 'SET_MAP_AUTO_IMAGE_PROCESSING',
	SET_MAP_MANUAL_IMAGE_PROCESSING: 'SET_MAP_MANUAL_IMAGE_PROCESSING',
	CONTEXT_MENU: {
		SHOW: 'CONTEXT_MENU_SHOW',
		DISPLAY: 'CONTEXT_MENU_DISPLAY'
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
		ACTIVE_IMAGERY_MOUSE_ENTER: 'ACTIVE_IMAGERY_MOUSE_ENTER',
		ACTIVE_IMAGERY_MOUSE_LEAVE: 'ACTIVE_IMAGERY_MOUSE_LEAVE',
		ACTIVE_MAP_CHANGED: 'ACTIVE_MAP_CHANGED',
		MAPS_LIST_CHANGED: 'MAPS_LIST_CHANGED',
		CONTEXT_MENU: 'CONTEXT_MENU',
		PIN_LOCATION_MODE: 'PIN_LOCATION_MODE',
		ANNOTATION_SELECT: 'ANNOTATION_SELECT',
		ANNOTATION_REMOVE_FEATURE: 'ANNOTATION_REMOVE_FEATURE',
		ANNOTATION_UPDATE_FEATURE: 'ANNOTATION_UPDATE_FEATURE',
		CLICK_OUTSIDE_MAP: 'CLICK_OUTSIDE_MAP'
	},
	SET_PENDING_MAPS_COUNT: 'SET_PENDING_MAPS_COUNT',
	DECREASE_PENDING_MAPS_COUNT: 'DECREASE_PENDING_MAPS_COUNT',
	SET_PENDING_OVERLAYS: 'SET_PENDING_OVERLAYS',
	REMOVE_PENDING_OVERLAY: 'REMOVE_PENDING_OVERLAY',
	SHADOW_MOUSE_PRODUCER: 'SHADOW_MOUSE_PRODUCER'
};

export interface IContextMenuShowPayload {
	point: Point;
	overlays: IOverlay[];
	event: MouseEvent;
}

export type MapActions = any;

export class SetProgressBarAction implements Action {
	type = MapActionTypes.VIEW.SET_PROGRESS_BAR;

	constructor(public payload: { mapId: string, progress: number }) {
	}
}


export class ActiveMapChangedAction implements Action {
	type = MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED;

	constructor(public payload: string) {
	}
}

export class PositionChangedAction implements Action {
	type = MapActionTypes.POSITION_CHANGED;

	constructor(public payload: { id: string, position: ICaseMapPosition, mapInstance: ICaseMapState }) {
	}
}

export class UpdateMapSizeAction implements Action {
	type = MapActionTypes.UPDATE_MAP_SIZE;

	constructor() {
	}
}

export class ImageryCreatedAction implements Action {
	type = MapActionTypes.IMAGERY_CREATED;

	constructor(public payload: IImageryChanged) {
	}
}

export class ImageryRemovedAction implements Action {
	type = MapActionTypes.IMAGERY_REMOVED;

	constructor(public payload: IImageryChanged) {
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

export class PinLocationModeTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.PIN_LOCATION_MODE;

	constructor(public payload: boolean) {
	}
}

export class MapsListChangedAction implements Action {
	type = MapActionTypes.TRIGGER.MAPS_LIST_CHANGED;

	constructor(public payload: ICaseMapState[]) {
	}
}

export class AnnotationSelectAction implements Action {
	type = MapActionTypes.TRIGGER.ANNOTATION_SELECT;

	constructor(public payload: IAnnotationsSelectionEventData) {

	}
}

export class AnnotationRemoveFeature implements Action {
	type = MapActionTypes.TRIGGER.ANNOTATION_REMOVE_FEATURE;

	constructor(public payload: string) {

	};
}

export class AnnotationUpdateFeature implements Action {
	type = MapActionTypes.TRIGGER.ANNOTATION_UPDATE_FEATURE;

	constructor(public payload: IUpdateFeatureEvent) {

	};
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

	constructor(public payload: { point: { coordinates: Array<number>, type: string }, outsideSource?: boolean }) {

	}
}
