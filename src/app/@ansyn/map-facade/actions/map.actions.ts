import { Action } from '@ngrx/store';
import { Point, Position } from 'geojson';
import { ImageryChanged } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapInstanceChanged } from '@ansyn/imagery/imagery/manager/imagery.component.manager';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { AnnotationsContextMenuEvent } from '@ansyn/core/models/visualizers/annotations.model';

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
		DISPLAY: 'DISPLAY'
	},
	VISUALIZERS: {
		HOVER_FEATURE: 'HOVER_FEATURE',
	},
	DRAW_OVERLAY_ON_MAP: 'DRAW_OVERLAY_ON_MAP',
	MAP_INSTANCE_CHANGED_ACTION: 'MAP_INSTANCE_CHANGED_ACTION',
	IMAGERY_PLUGINS_INITIALIZED: 'IMAGERY_PLUGINS_INITIALIZED',
	STORE: {
		SET_MAPS_DATA: 'SET_MAPS_DATA',
	},
	VIEW: {
		SET_IS_LOADING: 'SET_IS_LOADING',
		SET_PROGRESS_BAR: 'SET_PROGRESS_BAR'
	},
	TRIGGER: {
		ACTIVE_IMAGERY_MOUSE_ENTER: 'ACTIVE_IMAGERY_MOUSE_ENTER',
		ACTIVE_IMAGERY_MOUSE_LEAVE: 'ACTIVE_IMAGERY_MOUSE_LEAVE',
		ACTIVE_MAP_CHANGED: 'ACTIVE_MAP_CHANGED',
		MAPS_LIST_CHANGED: 'MAPS_LIST_CHANGED',
		CONTEXT_MENU: 'CONTEXT_MENU',
		PIN_LOCATION_MODE: 'PIN_LOCATION_MODE',
		ANNOTATION_CONTEXT_MENU: 'ANNOTATION_CONTEXT_MENU',
		ANNOTATION_REMOVE_FEATURE: 'ANNOTATION_REMOVE_FEATURE',
		CLICK_OUTSIDE_MAP: 'CLICK_OUTSIDE_MAP'
	},
	SET_PENDING_MAPS_COUNT: 'SET_PENDING_MAPS_COUNT',
	DECREASE_PENDING_MAPS_COUNT: 'DECREASE_PENDING_MAPS_COUNT',
	SET_PENDING_OVERLAYS: 'SET_PENDING_OVERLAYS',
	REMOVE_PENDING_OVERLAY: 'REMOVE_PENDING_OVERLAY'
};

export interface ContextMenuShowPayload  {
	point: Point;
	overlays: Overlay[];
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

	constructor(public payload: { id: string, position: CaseMapPosition, mapInstance: CaseMapState }) {
	}
}

export class UpdateMapSizeAction implements Action {
	type = MapActionTypes.UPDATE_MAP_SIZE;

	constructor() {
	}
}

export class ImageryCreatedAction implements Action {
	type = MapActionTypes.IMAGERY_CREATED;

	constructor(public payload: ImageryChanged) {
	}
}

export class ImageryRemovedAction implements Action {
	type = MapActionTypes.IMAGERY_REMOVED;

	constructor(public payload: ImageryChanged) {
	}
}

export class MapInstanceChangedAction implements Action {
	type = MapActionTypes.MAP_INSTANCE_CHANGED_ACTION;
	constructor(public payload: MapInstanceChanged) {
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

export class SetMapAutoImageProcessing implements Action {
	type = MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING;

	constructor(public payload: { mapId: string, toggleValue: boolean }) {
	}
}

export class SetMapManualImageProcessing implements Action {
	type = MapActionTypes.SET_MAP_MANUAL_IMAGE_PROCESSING;

	constructor(public payload: { mapId: string, processingParams: Object }) {
	}
}

export class ContextMenuShowAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.SHOW;

	constructor(public payload: ContextMenuShowPayload) {
	}
}

export class ContextMenuDisplayAction implements Action {
	type = MapActionTypes.CONTEXT_MENU.DISPLAY;

	constructor(public payload: string) {
	}
}

export class DrawOverlaysOnMapTriggerAction implements Action {
	type = MapActionTypes.DRAW_OVERLAY_ON_MAP;

	constructor() {
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

export class AnnotationContextMenuTriggerAction implements Action {
	type = MapActionTypes.TRIGGER.ANNOTATION_CONTEXT_MENU;

	constructor(public payload: AnnotationsContextMenuEvent) {

	}
}

export class AnnotationRemoveFeature implements Action {
	type = MapActionTypes.TRIGGER.ANNOTATION_REMOVE_FEATURE;

	constructor(public payload: string) {

	};
}

export class DecreasePendingMapsCountAction implements Action {
	type: string = MapActionTypes.DECREASE_PENDING_MAPS_COUNT;

	constructor() {
	}
}

export class SetPendingOverlaysAction implements Action {
	type: string = MapActionTypes.SET_PENDING_OVERLAYS;

	constructor(public payload: string[]) {
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

export class ImageryPluginsInitialized implements Action {
	readonly type = MapActionTypes.IMAGERY_PLUGINS_INITIALIZED;
	constructor(payload: string) {
	}
}

export class ClickOutsideMap implements Action  {
	readonly type = MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP;
	constructor(public payload: any) {
	}
}
