import { Action } from '@ngrx/store';
import { AlertMsgTypes } from '../../../alerts/model';
import { IOverlay } from '../../models/overlay.model';
import {
	IImageManualProcessArgs, IOverlaysManualProcessArgs,
	IOverlaysScannedAreaData,
	IOverlaysTranslationData,
} from '../../../menu-items/cases/models/case.model';
import { IScannedArea } from '../reducers/overlay-status.reducer';
import { ILogMessage } from '../../../core/models/logger.model';

export enum OverlayStatusActionsTypes {
	SET_MANUAL_IMAGE_PROCESSING = 'SET_MANUAL_IMAGE_PROCESSING',
	LOG_MANUAL_IMAGE_PROCESSING = 'LOG_MANUAL_IMAGE_PROCESSING',
	BACK_TO_WORLD_VIEW = 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS = 'BACK_TO_WORLD_SUCCESS',
	BACK_TO_WORLD_FAILED = 'BACK_TO_WORLD_FAILED',
	SET_FAVORITE_OVERLAYS = 'SET_FAVORITE_OVERLAYS',
	TOGGLE_OVERLAY_FAVORITE = 'TOGGLE_OVERLAY_FAVORITE',
	SET_REMOVED_OVERLAYS_VISIBILITY = 'SET_REMOVED_OVERLAYS_VISIBILITY',
	TOGGLE_OVERLAY_PRESET = 'TOGGLE_OVERLAY_PRESET',
	SET_AUTO_IMAGE_PROCESSING = 'SET_AUTO_IMAGE_PROCESSING',
	SET_AUTO_IMAGE_PROCESSING_SUCCESS = 'SET_AUTO_IMAGE_PROCESSING_SUCCESS',
	ENABLE_IMAGE_PROCESSING = 'ENABLE_IMAGE_PROCESSING',
	DISABLE_IMAGE_PROCESSING = 'DISABLE_IMAGE_PROCESSING',
	ADD_ALERT_MSG = 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG = 'REMOVE_ALERT_MSG',
	TOGGLE_DRAGGED_MODE = 'TOGGLE_DRAGGED_MODE',
	SET_OVERLAY_TRANSLATION_DATA = 'SET_OVERLAY_TRANSLATION_DATA',
	SET_OVERLAYS_TRANSLATION_DATA = 'SET_OVERLAYS_TRANSLATION_DATA',
	SET_OVERLAY_SCANNED_AREA_DATA = 'SET_OVERLAY_SCANNED_AREA_DATA',
	SET_OVERLAYS_SCANNED_AREA_DATA = 'SET_OVERLAYS_SCANNED_AREA_DATA',
	ACTIVATE_SCANNED_AREA = 'ACTIVATE_SCANNED_AREA',
	UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS = 'UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS'
}


export type OverlayStatusActions =
	BackToWorldView
	| BackToWorldSuccess
	| BackToWorldFailed
	| ToggleFavoriteAction
	|
	SetFavoriteOverlaysAction
	|
	ActivateScannedAreaAction
	| SetOverlaysScannedAreaDataAction
	| SetOverlayScannedAreaDataAction
	| SetOverlayTranslationDataAction
	|
	SetOverlaysTranslationDataAction
	| ToggleDraggedModeAction;

export class UpdateOverlaysManualProcessArgs implements Action {
	type = OverlayStatusActionsTypes.UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS;

	constructor(public payload: { override?: boolean, data: IOverlaysManualProcessArgs }) {

	}
}

export class ActivateScannedAreaAction implements Action {
	type: string = OverlayStatusActionsTypes.ACTIVATE_SCANNED_AREA;

	constructor() {
	}
}

export class SetOverlayScannedAreaDataAction implements Action {
	type: string = OverlayStatusActionsTypes.SET_OVERLAY_SCANNED_AREA_DATA;

	constructor(public payload: IScannedArea) {
	}
}

export class SetOverlaysScannedAreaDataAction implements Action {
	type: string = OverlayStatusActionsTypes.SET_OVERLAYS_SCANNED_AREA_DATA;

	constructor(public payload: IOverlaysScannedAreaData) {
	}
}

export class SetAutoImageProcessing implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.SET_AUTO_IMAGE_PROCESSING;

	constructor(public payload?: { mapId: string }) {
	}

	logMessage() {
		return `Trying to toggle auto image processing`
	}
}

export class SetAutoImageProcessingSuccess implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS;

	constructor(public payload: { value: boolean, fromUI?: boolean }) {
	}

	logMessage() {
		return this.payload.fromUI ? `Auto image processing was set to ${this.payload.value}` : null;
	}
}

export class EnableImageProcessing implements Action {
	type = OverlayStatusActionsTypes.ENABLE_IMAGE_PROCESSING;

	constructor(public payload?: any) {
	};
}

export class DisableImageProcessing implements Action {
	type = OverlayStatusActionsTypes.DISABLE_IMAGE_PROCESSING;

	constructor(public payload?: any) {
	};
}

export class BackToWorldView implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW;

	constructor(public payload: { mapId: string }) {

	}

	logMessage() {
		return `Going back to world map`
	}
}

export class SetManualImageProcessing implements Action {
	type = OverlayStatusActionsTypes.SET_MANUAL_IMAGE_PROCESSING;

	constructor(public payload: IImageManualProcessArgs) {
	};
}

export class LogManualImageProcessing implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.LOG_MANUAL_IMAGE_PROCESSING;

	constructor(public payload: { changedArg: string, allArgs: ImageManualProcessArgs }) {
	};

	logMessage() {
		return `Updating manual image processing param: ${this.payload.changedArg}\n${JSON.stringify(this.payload.allArgs)}`
	}
}

export class BackToWorldSuccess extends BackToWorldView {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS;

	logMessage() {
		return null
	}
}

export class BackToWorldFailed extends BackToWorldView {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_FAILED;

	constructor(public payload: { mapId: string, error: any }) {
		super(payload)
	}

	logMessage(): string {
		return `Going back to world map failed${this.payload.error ? '\n' + this.payload.error.toString() : ''}`;
	}
}

export class ToggleFavoriteAction implements Action, ILogMessage {
	type: string = OverlayStatusActionsTypes.TOGGLE_OVERLAY_FAVORITE;

	constructor(public payload: { id: string, value: boolean, overlay?: IOverlay }) {
	}

	logMessage() {
		return `${this.payload.value ? 'Adding' : 'Removing'} overlay ${this.payload.value ? 'to' : 'from'} favorites`
	}
}

export class SetFavoriteOverlaysAction implements Action {
	type = OverlayStatusActionsTypes.SET_FAVORITE_OVERLAYS;

	constructor(public payload: IOverlay[]) {
	}
}

export class AddAlertMsg implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.ADD_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}

	logMessage() {
		return `Adding overlay alert message ${this.payload.key}`
	}
}

export class RemoveAlertMsg implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.REMOVE_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}

	logMessage() {
		return `Removing overlay alert message ${this.payload.key}`
	}

}

export class ToggleDraggedModeAction implements Action, ILogMessage {
	type = OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE;

	constructor(public payload: { mapId: string, overlayId: string, dragged: boolean }) {
	}

	logMessage() {
		return `${this.payload.dragged ? 'Start' : 'End'} annotations drag mode`
	}
}

export class SetOverlayTranslationDataAction implements Action {
	type = OverlayStatusActionsTypes.SET_OVERLAY_TRANSLATION_DATA;

	constructor(public payload: { overlayId: string, offset: [number, number] }) {
	}
}

export class SetOverlaysTranslationDataAction implements Action {
	type = OverlayStatusActionsTypes.SET_OVERLAYS_TRANSLATION_DATA;

	constructor(public payload: IOverlaysTranslationData) {
	}
}
