import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { AlertMsgTypes, IToastMessage } from '../reducers/core.reducer';
import { Overlay, OverlaysCriteria } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';

export const CoreActionTypes = {
	TOGGLE_MAP_LAYERS: type('[Core] TOGGLE_MAP_LAYERS'),
	TOGGLE_OVERLAY_FAVORITE: type('[Core] TOGGLE_FAVORITE'),
	SET_TOAST_MESSAGE: type('[Core] SET_TOAST_MESSAGE'),
	SET_FAVORITE_OVERLAYS: type('[Core] SET_FAVORITE_OVERLAYS'),
	CLEAR_ACTIVE_INTERACTIONS: type('[Core] CLEAR_ACTIVE_INTERACTIONS'),
	ADD_ALERT_MSG: 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG: 'REMOVE_ALERT_MSG',
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA',
	SET_LAYOUT: 'SET_LAYOUT',
	SET_LAYOUT_SUCCESS: 'SET_LAYOUT_SUCCESS',
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS: 'BACK_TO_WORLD_SUCCESS',
	SET_IS_AFTER_LOGIN_FLAG: 'SET_IS_AFTER_LOGIN_FLAG'
};

export type CoreActions =
	ToggleMapLayersAction
	| ToggleFavoriteAction
	| SetToastMessageAction
	| SetFavoriteOverlaysAction
	| ClearActiveInteractionsAction
	| AddAlertMsg
	| RemoveAlertMsg
	| BackToWorldView
	| BackToWorldSuccess

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

export class AddAlertMsg implements Action {
	type = CoreActionTypes.ADD_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}
}

export class RemoveAlertMsg implements Action {
	type = CoreActionTypes.REMOVE_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
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

export class BackToWorldView implements Action {
	type = CoreActionTypes.BACK_TO_WORLD_VIEW;

	constructor(public payload: { mapId: string }) {

	}
}

export class BackToWorldSuccess extends BackToWorldView {
	type = CoreActionTypes.BACK_TO_WORLD_SUCCESS;
}

export class SetIsAfterLoginFlagAction implements Action {
	type = CoreActionTypes.SET_IS_AFTER_LOGIN_FLAG;

	constructor(public payload: boolean) {

	}
}


