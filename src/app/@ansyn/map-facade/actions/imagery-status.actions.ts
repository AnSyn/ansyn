import { Action } from '@ngrx/store';
import { AlertMsgTypes } from '../alerts/model';

export enum ImageryStatusActionTypes {
	TOGGLE_OVERLAY_PRESET = 'TOGGLE_OVERLAY_PRESET',
	SET_PRESET_OVERLAYS = 'SET_PRESET_OVERLAYS',
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
	ADD_ALERT_MSG = 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG = 'REMOVE_ALERT_MSG'
}



export class TogglePresetOverlayAction implements Action {
	type: string = ImageryStatusActionTypes.TOGGLE_OVERLAY_PRESET;

	constructor(public payload: { id: string, value: boolean, overlay?: any }) {
	}
}

export class SetPresetOverlaysAction implements Action {
	type = ImageryStatusActionTypes.SET_PRESET_OVERLAYS;

	constructor(public payload: any[]) {
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
