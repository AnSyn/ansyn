import { IPendingOverlay } from '@ansyn/map-facade';
import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import {
	IOverlay,
	IOverlayDrop,
	IOverlaysCriteria,
	IOverlaysCriteriaOptions,
	IOverlaysHash,
	IOverlaySpecialObject,
} from '../models/overlay.model';
import { IMarkUpData, IOverlayDropMarkUp, ITimelineRange, MarkUpClass } from '../reducers/overlays.reducer';

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
	REDRAW_TIMELINE: type('[Overlay] Redraw Timeline'),
	ADD_OVERLAYS_MARKUPS: type('ADD_OVERLAYS_MARKUPS'),
	REMOVE_OVERLAYS_MARKUPS: type('REMOVE_OVERLAYS_MARKUPS'),
	SET_OVERLAYS_MARKUPS: type('SET_OVERLAYS_MARKUPS'),
	UPDATE_OVERLAYS_COUNT: type('UPDATE_OVERLAYS_COUNT'),
	SET_FILTERED_OVERLAYS: type('SET_FILTERED_OVERLAYS'),
	SET_TIMELINE_STATE: type('SET_TIMELINE_STATE'),
	SET_SPECIAL_OBJECTS: type('SET_SPECIAL_OBJECTS'),
	SET_DROPS: type('SET_DROPS'),
	MOUSE_OVER_DROP: type('MOUSE_OVER_DROP'),
	MOUSE_OUT_DROP: type('MOUSE_OUT_DROP'),
	SET_OVERLAYS_STATUS_MESSAGE: type('SET_OVERLAYS_STATUS_MESSAGE'),
	SET_HOVERED_OVERLAY: type('SET_HOVERED_OVERLAY'),
	CHANGE_OVERLAY_PREVIEW_ROTATION: type('[Overlay] CHANGE_OVERLAY_PREVIEW_ROTATION'),
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA',
	UPDATE_OVERLAY_COUNT: 'UPDATE_OVERLAY_COUNT',
	SET_MISC_OVERLAYS: 'SET_MISC_OVERLAYS',
	SET_MISC_OVERLAY: 'SET_MISC_OVERLAY',
};

export class SelectOverlayAction implements Action {
	type = OverlaysActionTypes.SELECT_OVERLAY;

	constructor(public payload: string) {
	}
}

export class SetMarkUp implements Action {
	type = OverlaysActionTypes.SET_OVERLAYS_MARKUPS;

	constructor(public payload: { classToSet: MarkUpClass, dataToSet: IMarkUpData }) {
	};
}

export class AddMarkUp implements Action {
	type = OverlaysActionTypes.ADD_OVERLAYS_MARKUPS;

	constructor(public payload: Array<IOverlayDropMarkUp>) {
	};
}


export class RemoveMarkUp implements Action {
	type = OverlaysActionTypes.REMOVE_OVERLAYS_MARKUPS;

	// array of overlay ids
	constructor(public payload: { overlayIds?: Array<string>, markupToRemove?: Array<IOverlayDropMarkUp> }) {
	};
}


export class UnSelectOverlayAction implements Action {
	type = OverlaysActionTypes.UNSELECT_OVERLAY;

	constructor(public payload: string) {
	}
}

export class LoadOverlaysAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS;

	constructor(public payload: IOverlaysCriteria) {
	}
}

export class RequestOverlayByIDFromBackendAction implements Action {
	type = OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND;

	constructor(public payload: { overlayId: string, sourceType: string, mapId?: string }) {
	}
}

export class LoadOverlaysSuccessAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS;

	constructor(public payload: IOverlay[], public clearExistingOverlays = false) {
	}
}

export class LoadOverlaysFailAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_FAIL;

	constructor(public payload: IOverlay[]) {
	}
}

export class ClearFilterAction implements Action {
	type = OverlaysActionTypes.CLEAR_FILTER;

	constructor(public payload?: any) {
	}
}

export class DisplayOverlayFromStoreAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE;

	constructor(public payload: { id: string, mapId?: string, extent?: any, openWithAngle?: number }) {
	}
}

export class DisplayMultipleOverlaysFromStoreAction implements Action {
	type = OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE;

	constructor(public payload: IPendingOverlay[]) {
	}
}

export class DisplayOverlayAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY;

	constructor(public payload: { overlay: IOverlay, mapId: string, extent?: any, forceFirstDisplay?: boolean, force?: boolean, openWithAngle?: number }) {
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

export class SetFilteredOverlaysAction implements Action {
	type = OverlaysActionTypes.SET_FILTERED_OVERLAYS;

	constructor(public payload: string[]) {
	}
}

export class SetTimelineStateAction implements Action {
	type = OverlaysActionTypes.SET_TIMELINE_STATE;

	constructor(public payload: { timeLineRange: ITimelineRange }) {
	}
}

export class SetSpecialObjectsActionStore implements Action {
	type = OverlaysActionTypes.SET_SPECIAL_OBJECTS;

	constructor(public payload: Array<IOverlaySpecialObject>) {
	};
}

export class SetDropsAction implements Action {
	type = OverlaysActionTypes.SET_DROPS;

	constructor(public payload: Array<IOverlayDrop>) {
	};
}

export class SetOverlaysStatusMessage implements Action {
	type = OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE;

	constructor(public payload: string) {
	}
}

export class RedrawTimelineAction implements Action {
	type = OverlaysActionTypes.REDRAW_TIMELINE;

	constructor(public payload?: string) {
	}
}

export class SetHoveredOverlayAction implements Action {
	type = OverlaysActionTypes.SET_HOVERED_OVERLAY;

	constructor(public payload?: IOverlay) {

	}
}

export class ChangeOverlayPreviewRotationAction implements Action {
	type = OverlaysActionTypes.CHANGE_OVERLAY_PREVIEW_ROTATION;

	constructor(public payload: number) {

	}
}

export class SetOverlaysCriteriaAction implements Action {
	type = OverlaysActionTypes.SET_OVERLAYS_CRITERIA;

	constructor(public payload: IOverlaysCriteria,
				public options: IOverlaysCriteriaOptions = null) {
	}
}

export class UpdateOverlaysCountAction {
	type = OverlaysActionTypes.UPDATE_OVERLAY_COUNT;

	constructor(public payload: number) {
	}
}

export class SetMiscOverlays implements Action {
	type: string = OverlaysActionTypes.SET_MISC_OVERLAYS;

	constructor(public payload: { miscOverlays: IOverlaysHash }) {
	}
}

export class SetMiscOverlay implements Action {
	type: string = OverlaysActionTypes.SET_MISC_OVERLAY;

	constructor(public payload: { key: string, overlay: IOverlay }) {
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
	| SetFilteredOverlaysAction
	| SetOverlaysStatusMessage
	| AddMarkUp
	| RemoveMarkUp
	| SetHoveredOverlayAction
	| ChangeOverlayPreviewRotationAction
	| SetSpecialObjectsActionStore
	| SetDropsAction
	| SetOverlaysCriteriaAction
	| SetMiscOverlays
	| SetMiscOverlay
