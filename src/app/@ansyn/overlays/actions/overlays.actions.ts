import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { Overlay } from '../models/overlay.model';
import { OverlaySpecialObject } from '@ansyn/core';
import { TimelineState } from '../reducers/overlays.reducer';
import { OverlaysCriteria } from '@ansyn/core/models/overlay.model';

export const OverlaysActionTypes = {
	SELECT_OVERLAY: type('[Overlay] Select Overlay'),
	UNSELECT_OVERLAY: type('[Overlay] Unselect Overlay'),
	LOAD_OVERLAYS: type('[Overlay] Load Overlays'),
	REQUEST_OVERLAY_FROM_BACKEND: type('[Overlay] Load Overlay By Id'),
	LOAD_OVERLAYS_SUCCESS: type('[Overlay] Load Overlays Success'),
	LOAD_OVERLAYS_FAIL: type('[Overlay] Load Overlays Failed'),
	CLEAR_FILTER: type('[Overlay] Clear Filter'),
	DISPLAY_OVERLAY_FROM_STORE: type('[Overlay] Display Overlay From Store'),
	DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE: type('[Overlay] Display Multiple Overlays From Store'),
	DISPLAY_OVERLAY: type('[Overlay] Display Overlay'),
	DISPLAY_OVERLAY_SUCCESS: type('[Overlay] Display Overlay Success'),
	DISPLAY_OVERLAY_FAILED: type('[Overlay] Display Overlay Failed'),
	DEMO: type('[Overlay] demo'),
	REDRAW_TIMELINE: type('[Overlay] Redraw Timeline'),
	OVERLAYS_MARKUPS: type('OVERLAYS_MARKUPS'),
	UPDATE_OVERLAYS_COUNT: type('UPDATE_OVERLAYS_COUNT'),
	SET_FILTERED_OVERLAYS: type('SET_FILTERED_OVERLAYS'),
	SET_TIMELINE_STATE: type('SET_TIMELINE_STATE'),
	GO_NEXT_DISPLAY: type('GO_NEXT_DISPLAY'),
	GO_PREV_DISPLAY: type('GO_PREV_DISPLAY'),
	SET_SPECIAL_OBJECTS: type('SET_SPECIAL_OBJECTS'),
	MOUSE_OVER_DROP: type('MOUSE_OVER_DROP'),
	MOUSE_OUT_DROP: type('MOUSE_OUT_DROP'),
	SET_OVERLAYS_STATUS_MESSAGE: type('SET_OVERLAYS_STATUS_MESSAGE')
};

export class SelectOverlayAction implements Action {
	type = OverlaysActionTypes.SELECT_OVERLAY;

	constructor(public payload: string) {
	}
}

export class OverlaysMarkupAction implements Action {
	type = OverlaysActionTypes.OVERLAYS_MARKUPS;

	constructor(public payload?: any) {
	};
}

export class UnSelectOverlayAction implements Action {
	type = OverlaysActionTypes.UNSELECT_OVERLAY;

	constructor(public payload: string) {
	}
}

export class LoadOverlaysAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS;

	constructor(public payload: OverlaysCriteria) {
	}
}

export class RequestOverlayByIDFromBackendAction implements Action {
	type = OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND;

	constructor(public payload: { overlayId: string, sourceType: string, mapId?: string }) {
	}
}

export class LoadOverlaysSuccessAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS;

	constructor(public payload: { overlays: Overlay[], refresh?: boolean }) {
	}
}

export class LoadOverlaysFailAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_FAIL;

	constructor(public payload: Overlay[]) {
	}
}

export class ClearFilterAction implements Action {
	type = OverlaysActionTypes.CLEAR_FILTER;

	constructor(public payload?: any) {
	}
}

export class DisplayOverlayFromStoreAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE;

	constructor(public payload: { id: string, mapId?: string }) {
	}
}

export class DisplayMultipleOverlaysFromStoreAction implements Action {
	type = OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE;

	constructor(public payload: string[]) {
	}
}

export class DisplayOverlayAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY;

	constructor(public payload: { overlay: Overlay, mapId: string, ignoreRotation?: boolean }) {
	}
}

export class DisplayOverlaySuccessAction extends DisplayOverlayAction {
	type = OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS;
}

export class DisplayOverlayFailedAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY_FAILED;

	constructor(public payload: { id: string, mapId?: string }) {
	}
}

export class DemoAction implements Action {
	type = OverlaysActionTypes.DEMO;

	constructor(public payload: any) {
	}
}

export class RedrawTimelineAction implements Action {
	type = OverlaysActionTypes.REDRAW_TIMELINE;

	constructor(public payload?: boolean) {
	};
}

export class UpdateOverlaysCountAction implements Action {
	type = OverlaysActionTypes.UPDATE_OVERLAYS_COUNT;

	constructor(public payload: number) {
	}
}

export class SetFilteredOverlaysAction implements Action {
	type = OverlaysActionTypes.SET_FILTERED_OVERLAYS;

	constructor(public payload: string[]) {
	}
}

export class SetTimelineStateAction implements Action {
	type = OverlaysActionTypes.SET_TIMELINE_STATE;

	constructor(public payload: { state: TimelineState, noRedraw?: boolean }) {
	}
}

export class GoNextDisplayAction implements Action {
	type = OverlaysActionTypes.GO_NEXT_DISPLAY;

	constructor(public payload: string) {
	}
}

export class GoPrevDisplayAction implements Action {
	type = OverlaysActionTypes.GO_PREV_DISPLAY;

	constructor(public payload: string) {
	}
}

export class SetSpecialObjectsActionStore implements Action {
	type = OverlaysActionTypes.SET_SPECIAL_OBJECTS;

	constructor(public payload: Array<OverlaySpecialObject>) {
	};
}

export class MouseOverDropAction implements Action {
	type = OverlaysActionTypes.MOUSE_OVER_DROP;

	constructor(public payload: string) {
	}
}

export class MouseOutDropAction implements Action {
	type = OverlaysActionTypes.MOUSE_OUT_DROP;

	constructor(public payload: string) {
	}
}

export class SetOverlaysStatusMessage implements Action {
	type = OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE;

	constructor(public payload: string) {
	}
}


export type OverlaysActions
	= DisplayOverlayFromStoreAction
	| DisplayMultipleOverlaysFromStoreAction
	| DisplayOverlayAction
	| DisplayOverlaySuccessAction
	| DisplayOverlayFailedAction
	| SelectOverlayAction
	| UnSelectOverlayAction
	| RequestOverlayByIDFromBackendAction
	| LoadOverlaysAction
	| LoadOverlaysSuccessAction
	| LoadOverlaysFailAction
	| ClearFilterAction
	| DemoAction
	| RedrawTimelineAction
	| OverlaysMarkupAction
	| SetFilteredOverlaysAction
	| GoNextDisplayAction
	| GoPrevDisplayAction
	| MouseOverDropAction
	| MouseOutDropAction
	| SetOverlaysStatusMessage;
