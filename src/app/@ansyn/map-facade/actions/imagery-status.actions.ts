import { Action } from '@ngrx/store';

export enum ImageryStatusActionTypes {
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
	ADD_ALERT_MSG = 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG = 'REMOVE_ALERT_MSG'
}

export class EnableCopyOriginalOverlayDataAction implements Action {
	type: string = ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA;

	constructor(public payload: boolean) {
	}
}

export class AddAlertMsg implements Action {
	type = ImageryStatusActionTypes.ADD_ALERT_MSG;
	// TODO: change any to AlertMsgTypes
	constructor(public payload: { value: string, key: any }) {
	}
}

export class RemoveAlertMsg implements Action {
	type = ImageryStatusActionTypes.REMOVE_ALERT_MSG;
	// TODO: change any to AlertMsgTypes
	constructor(public payload: { value: string, key: any }) {
	}
}
