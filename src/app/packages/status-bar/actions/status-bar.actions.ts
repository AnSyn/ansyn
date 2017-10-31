import { Action } from '@ngrx/store';
import { IToastMessage } from '../reducers/status-bar.reducer';

export const StatusBarActionsTypes = {
	CHANGE_LAYOUT: 'CHANGE_LAYOUT',
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SELECTED_CASE_LINK: 'COPY_SELECTED_CASE_LINK',
	SET_TOAST_MESSAGE: 'SET_TOAST_MESSAGE',
	UPDATE_STATUS_FLAGS: 'UPDATE_STATUS_FLAGS',
	OPEN_SHARE_LINK: 'OPEN_SHARE_LINK',

	GO_PREV: 'GO_PREV',
	GO_NEXT: 'GO_NEXT',
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	FAVORITE: 'FAVORITE',
	EXPAND: 'EXPAND',

	SET_ORIENTATION: 'SET_ORIENTATION',
	SET_GEO_FILTER: 'SET_GEO_FILTER',
	SET_TIME: 'SET_TIME',
	MAP_GEO_ENABLED_MODE_CHANGED: 'MAP_GEO_ENABLED_MODE_CHANGED',
	SET_OVERLAYS_COUNT: 'SET_OVERLAYS_COUNT',
	SET_NOT_FROM_CASE_OVERLAY: 'SET_NOT_FROM_CASE_OVERLAY'
};
// some actions does not have payload
export type StatusActions = any;

export class ChangeLayoutAction implements Action {
	type: string = StatusBarActionsTypes.CHANGE_LAYOUT;

	constructor(public payload: number) {
	}
}

export class CopySelectedCaseLinkAction implements Action {
	type: string = StatusBarActionsTypes.COPY_SELECTED_CASE_LINK;

	constructor() {
	}
}

export class SetToastMessageStoreAction implements Action {
	type = StatusBarActionsTypes.SET_TOAST_MESSAGE;

	constructor(public payload?: IToastMessage) {
	}
}

export class UpdateStatusFlagsAction implements Action {
	type = StatusBarActionsTypes.UPDATE_STATUS_FLAGS;

	constructor(public payload: { key: string, value?: boolean }) {
		// code...
	}
}

export class OpenShareLink implements Action {
	type: string = StatusBarActionsTypes.OPEN_SHARE_LINK;

	constructor() {
	}
}

export class GoPrevAction implements Action {
	type: string = StatusBarActionsTypes.GO_PREV;

	constructor() {
	}
}

export class GoNextAction implements Action {
	type: string = StatusBarActionsTypes.GO_NEXT;

	constructor() {
	}
}

export class ExpandAction implements Action {
	type: string = StatusBarActionsTypes.EXPAND;

	constructor() {
	}
}

export class FavoriteAction implements Action {
	type: string = StatusBarActionsTypes.FAVORITE;

	constructor(public payload?: string) {
	}
}

export class BackToWorldViewAction implements Action {
	type: string = StatusBarActionsTypes.BACK_TO_WORLD_VIEW;

	constructor() {
	}
}

export class SetOrientationAction implements Action {
	type: string = StatusBarActionsTypes.SET_ORIENTATION;

	constructor(public payload: string) {
	}
}

export class SetGeoFilterAction implements Action {
	type: string = StatusBarActionsTypes.SET_GEO_FILTER;

	constructor(public payload: string) {
	}
}

export class SetTimeAction implements Action {
	type: string = StatusBarActionsTypes.SET_TIME;

	constructor(public payload: { from: Date, to: Date }) {
	}
}

export class SetMapGeoEnabledModeStatusBarActionStore implements Action {
	type = StatusBarActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED;

	constructor(public payload: boolean) {
	}
}

export class SetOverlaysCountAction implements Action {
	type = StatusBarActionsTypes.SET_OVERLAYS_COUNT;

	constructor(public payload: number) {
	}
}

export class SetOverlayNotInCaseAction implements Action {
	type = StatusBarActionsTypes.SET_NOT_FROM_CASE_OVERLAY;

	constructor(public payload: boolean) {
	}
}
