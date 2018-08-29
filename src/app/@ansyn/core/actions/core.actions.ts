import { Action } from '@ngrx/store';
import { type } from '../utils/type';
import { AlertMsgTypes, IToastMessage } from '../reducers/core.reducer';
import { IOverlay, IOverlaysCriteria, IOverlaysCriteriaOptions } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';
import { ICaseMapState } from '../models/case.model';

export const CoreActionTypes = {
	TOGGLE_MAP_LAYERS: type('[Core] TOGGLE_MAP_LAYERS'),
	TOGGLE_OVERLAY_FAVORITE: type('[Core] TOGGLE_FAVORITE'),
	TOGGLE_OVERLAY_PRESET: type('[Core] TOGGLE_OVERLAY_PRESET'),
	SET_TOAST_MESSAGE: type('[Core] SET_TOAST_MESSAGE'),
	SET_FAVORITE_OVERLAYS: type('[Core] SET_FAVORITE_OVERLAYS'),
	SET_PRESET_OVERLAYS: type('[Core] SET_PRESET_OVERLAYS'),
	CLEAR_ACTIVE_INTERACTIONS: type('[Core] CLEAR_ACTIVE_INTERACTIONS'),
	ADD_ALERT_MSG: 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG: 'REMOVE_ALERT_MSG',
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA',
	SET_LAYOUT: 'SET_LAYOUT',
	SET_LAYOUT_SUCCESS: 'SET_LAYOUT_SUCCESS',
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS: 'BACK_TO_WORLD_SUCCESS',
	GO_ADJACENT_OVERLAY: 'GO_ADJACENT_OVERLAY',
	GO_NEXT_PRESET_OVERLAY: 'GO_NEXT_PRESET_OVERLAY',
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA: 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
	SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG: 'SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG',
	UPDATE_OVERLAY_COUNT: 'UPDATE_OVERLAY_COUNT',
	SET_AUTO_SAVE: 'SET_AUTO_SAVE',
	SET_REMOVED_OVERLAY_IDS: 'SET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAY_ID: 'SET_REMOVED_OVERLAY_ID',
	RESET_REMOVED_OVERLAY_IDS: 'RESET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAYS_VISIBILITY: 'SET_REMOVED_OVERLAYS_VISIBILITY',
	SET_MAPS_DATA: 'SET_MAPS_DATA'
};

export type CoreActions =
	ToggleMapLayersAction
	| ToggleFavoriteAction
	| TogglePresetOverlayAction
	| SetToastMessageAction
	| SetFavoriteOverlaysAction
	| SetPresetOverlaysAction
	| ClearActiveInteractionsAction
	| AddAlertMsg
	| RemoveAlertMsg
	| BackToWorldView
	| BackToWorldSuccess
	| GoAdjacentOverlay
	| GoNextPresetOverlay
	| SetWasWelcomeNotificationShownFlagAction
	| UpdateOverlaysCountAction
	| SetRemovedOverlaysIdsAction
	| SetRemovedOverlaysIdAction
	| SetRemovedOverlaysVisibilityAction

export class GoAdjacentOverlay implements Action {
	type: string = CoreActionTypes.GO_ADJACENT_OVERLAY;

	constructor(public payload: { isNext: boolean }) {
	}
}

export class GoNextPresetOverlay implements Action {
	type: string = CoreActionTypes.GO_NEXT_PRESET_OVERLAY;

	constructor() {
	}
}

export class EnableCopyOriginalOverlayDataAction implements Action {
	type: string = CoreActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA;

	constructor(public payload: boolean) {
	}
}

export class ToggleMapLayersAction implements Action {
	type = CoreActionTypes.TOGGLE_MAP_LAYERS;

	constructor(public payload: { mapId: string }) {
	}
}

export class ToggleFavoriteAction implements Action {
	type: string = CoreActionTypes.TOGGLE_OVERLAY_FAVORITE;

	constructor(public payload: { id: string, value: boolean, overlay?: IOverlay }) {
	}
}

export class TogglePresetOverlayAction implements Action {
	type: string = CoreActionTypes.TOGGLE_OVERLAY_PRESET;

	constructor(public payload: { id: string, value: boolean, overlay?: IOverlay }) {
	}
}

export class SetToastMessageAction implements Action {
	type = CoreActionTypes.SET_TOAST_MESSAGE;

	constructor(public payload?: IToastMessage) {
	}
}

export class SetFavoriteOverlaysAction implements Action {
	type = CoreActionTypes.SET_FAVORITE_OVERLAYS;

	constructor(public payload: IOverlay[]) {
	}
}

export class SetPresetOverlaysAction implements Action {
	type = CoreActionTypes.SET_PRESET_OVERLAYS;

	constructor(public payload: IOverlay[]) {
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

	constructor(public payload: IOverlaysCriteria,
				public options: IOverlaysCriteriaOptions = null) {
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

export class SetWasWelcomeNotificationShownFlagAction implements Action {
	type = CoreActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG;

	constructor(public payload: boolean) {

	}
}

export class UpdateOverlaysCountAction {
	type = CoreActionTypes.UPDATE_OVERLAY_COUNT;

	constructor(public payload: number) {

	}
}

export class SetRemovedOverlaysIdsAction implements Action {
	type = CoreActionTypes.SET_REMOVED_OVERLAY_IDS;

	constructor(public payload: string[]) {

	}
}

export class ResetRemovedOverlaysIdsAction implements Action {
	type = CoreActionTypes.RESET_REMOVED_OVERLAY_IDS;
}

export class SetRemovedOverlaysIdAction implements Action {
	type = CoreActionTypes.SET_REMOVED_OVERLAY_ID;

	constructor(public payload: { id: string, value: boolean }) {

	}
}

export class SetRemovedOverlaysVisibilityAction implements Action {
	type = CoreActionTypes.SET_REMOVED_OVERLAYS_VISIBILITY;

	constructor(public payload: boolean) {

	}
}

export class SetAutoSave implements Action {
	readonly type = CoreActionTypes.SET_AUTO_SAVE;

	constructor(public payload: boolean) {
	}
}


export class SetMapsDataActionStore implements Action {
	type = CoreActionTypes.SET_MAPS_DATA;

	constructor(public payload: { mapsList?: ICaseMapState[], activeMapId?: string }) {
	}
}
