import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { IToastMessage, AlertMsgTypes  } from '../reducers/core.reducer';
import { Overlay } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';
import { OverlaysCriteria } from '../models/overlay.model';

export const CoreActionTypes = {
	TOGGLE_MAP_LAYERS: type('[Core] TOGGLE_MAP_LAYERS'),
	TOGGLE_OVERLAY_FAVORITE: type('[Core] TOGGLE_FAVORITE'),
	SET_TOAST_MESSAGE: type('[Core] SET_TOAST_MESSAGE'),
	SET_FAVORITE_OVERLAYS: type('[Core] SET_FAVORITE_OVERLAYS'),
	CLEAR_ACTIVE_INTERACTIONS: type('[Core] CLEAR_ACTIVE_INTERACTIONS'),
	UPDATE_ALERT_MSG: 'UPDATE_ALERT_MSG',
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA',
	SET_LAYOUT: 'SET_LAYOUT',
	SET_LAYOUT_SUCCESS: 'SET_LAYOUT_SUCCESS'
};

export type CoreActions =
	ToggleMapLayersAction
	| ToggleFavoriteAction
	| SetToastMessageAction
	| SetFavoriteOverlaysAction
	| ClearActiveInteractionsAction
	| UpdateAlertMsg

export class ToggleMapLayersAction implements Action {
	type = CoreActionTypes.TOGGLE_MAP_LAYERS;

	constructor(public payload: { mapId: string }) {
	}
}

export class ToggleFavoriteAction implements Action {
	type: string = CoreActionTypes.TOGGLE_OVERLAY_FAVORITE;

	constructor(public payload: Overlay) {
	}
}

export class SetToastMessageAction implements Action {
	type = CoreActionTypes.SET_TOAST_MESSAGE;

	constructor(public payload?: IToastMessage) {
	}
}

export class SetFavoriteOverlaysAction implements Action {
	type = CoreActionTypes.SET_FAVORITE_OVERLAYS;

	constructor(public payload: Overlay[]) {
	}
}

export class ClearActiveInteractionsAction implements Action {
	type = CoreActionTypes.CLEAR_ACTIVE_INTERACTIONS;

	constructor(public payload?: { skipClearFor: Array<any> }) {

	}
}

export class UpdateAlertMsg implements Action {
	type = CoreActionTypes.UPDATE_ALERT_MSG;

	constructor(public payload: { value: Set<string>, key: AlertMsgTypes }) {
	}
}

export class SetOverlaysCriteriaAction implements Action {
	type = CoreActionTypes.SET_OVERLAYS_CRITERIA;

	constructor(public payload: OverlaysCriteria) {
	}
}

export class SetLayoutAction implements Action {
	type = CoreActionTypes.SET_LAYOUT;

	constructor(public payload: LayoutKey) {
	}
}

export class SetLayoutSuccessAction implements Action {
	type = CoreActionTypes.SET_LAYOUT_SUCCESS;

	constructor() {
	}
}
