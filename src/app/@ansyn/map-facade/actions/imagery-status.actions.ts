import { Action } from '@ngrx/store';
import { AlertMsgTypes } from '../alerts/model';

export enum ImageryStatusActionTypes {
	TOGGLE_OVERLAY_FAVORITE = 'TOGGLE_OVERLAY_FAVORITE',
	TOGGLE_OVERLAY_PRESET = 'TOGGLE_OVERLAY_PRESET',
	SET_FAVORITE_OVERLAYS = 'SET_FAVORITE_OVERLAYS',
	SET_PRESET_OVERLAYS = 'SET_PRESET_OVERLAYS',
	SET_REMOVED_OVERLAY_IDS = 'SET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAY_IDS_COUNT = 'SET_REMOVED_OVERLAY_IDS_COUNT',
	RESET_REMOVED_OVERLAY_IDS = 'RESET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAY_ID = 'SET_REMOVED_OVERLAY_ID',
	SET_REMOVED_OVERLAYS_VISIBILITY = 'SET_REMOVED_OVERLAYS_VISIBILITY',
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
	ADD_ALERT_MSG = 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG = 'REMOVE_ALERT_MSG',
	SET_MAP_EXTRA_DESCRIPTION = 'SET_MAP_EXTRA_DESCRIPTION'
}

export class SetMapExtraDescription implements Action {
	type: string = ImageryStatusActionTypes.SET_MAP_EXTRA_DESCRIPTION;

	constructor(public payload: { id: string, extraDescription: string }) {
	}
}

export class ToggleFavoriteAction implements Action {
	type: string = ImageryStatusActionTypes.TOGGLE_OVERLAY_FAVORITE;

	constructor(public payload: { id: string, value: boolean, overlay?: any }) {
	}
}


export class TogglePresetOverlayAction implements Action {
	type: string = ImageryStatusActionTypes.TOGGLE_OVERLAY_PRESET;

	constructor(public payload: { id: string, value: boolean, overlay?: any }) {
	}
}

export class SetFavoriteOverlaysAction implements Action {
	type = ImageryStatusActionTypes.SET_FAVORITE_OVERLAYS;

	constructor(public payload: any[]) {
	}
}

export class SetPresetOverlaysAction implements Action {
	type = ImageryStatusActionTypes.SET_PRESET_OVERLAYS;

	constructor(public payload: any[]) {
	}
}


export class SetRemovedOverlaysIdsAction implements Action {
	type = ImageryStatusActionTypes.SET_REMOVED_OVERLAY_IDS;

	constructor(public payload: string[]) {

	}
}

export class ResetRemovedOverlaysIdsAction implements Action {
	type = ImageryStatusActionTypes.RESET_REMOVED_OVERLAY_IDS;
}

export class SetRemovedOverlaysIdAction implements Action {
	type = ImageryStatusActionTypes.SET_REMOVED_OVERLAY_ID;

	constructor(public payload: { mapId: string, id: string, value: boolean }) {

	}
}

export class SetRemovedOverlaysVisibilityAction implements Action {
	type = ImageryStatusActionTypes.SET_REMOVED_OVERLAYS_VISIBILITY;

	constructor(public payload: boolean) {

	}
}

export class SetRemovedOverlayIdsCount implements Action {
	readonly type = ImageryStatusActionTypes.SET_REMOVED_OVERLAY_IDS_COUNT;

	constructor(public payload: number) {
	}
}

export class EnableCopyOriginalOverlayDataAction implements Action {
	type: string = ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA;

	constructor(public payload: boolean) {
	}
}

export class AddAlertMsg implements Action {
	type = ImageryStatusActionTypes.ADD_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}
}

export class RemoveAlertMsg implements Action {
	type = ImageryStatusActionTypes.REMOVE_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}
}
