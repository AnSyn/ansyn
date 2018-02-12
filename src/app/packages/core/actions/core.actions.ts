import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { IToastMessage } from '../reducers/core.reducer';
import { Overlay } from '../models/overlay.model';
import { AlertMsgTypes, OverlaysCriteria } from '@ansyn/core';

export const CoreActionTypes = {
	TOGGLE_MAP_LAYERS: type('[Core] TOGGLE_MAP_LAYERS'),
	TOGGLE_OVERLAY_FAVORITE: type('[Core] TOGGLE_FAVORITE'),
	SET_TOAST_MESSAGE: type('[Core] SET_TOAST_MESSAGE'),
	SET_FAVORITE_OVERLAYS: type('[Core] SET_FAVORITE_OVERLAYS'),
	CLEAR_ACTIVE_INTERACTIONS: type('[Core] CLEAR_ACTIVE_INTERACTIONS'),
	UPDATE_ALERT_MSG: 'UPDATE_ALERT_MSG',
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA'
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

