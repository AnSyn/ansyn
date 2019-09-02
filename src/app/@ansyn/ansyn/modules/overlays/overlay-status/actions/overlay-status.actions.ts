import { Action } from '@ngrx/store';
import { AlertMsgTypes } from '../../../alerts/model';
import { IOverlay } from '../../models/overlay.model';
import { IOverlaysScannedAreaData, IOverlaysTranslationData } from '../../../menu-items/cases/models/case.model';
import { type } from '../../../core/utils/type';
import { ImageryMapPosition } from '@ansyn/imagery';


export enum OverlayStatusActionsTypes {
	BACK_TO_WORLD_VIEW = 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS = 'BACK_TO_WORLD_SUCCESS',
	SET_FAVORITE_OVERLAYS = 'SET_FAVORITE_OVERLAYS',
	TOGGLE_OVERLAY_FAVORITE = 'TOGGLE_OVERLAY_FAVORITE',
	SET_REMOVED_OVERLAY_IDS = 'SET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAY_IDS_COUNT = 'SET_REMOVED_OVERLAY_IDS_COUNT',
	RESET_REMOVED_OVERLAY_IDS = 'RESET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAY_ID = 'SET_REMOVED_OVERLAY_ID',
	SET_REMOVED_OVERLAYS_VISIBILITY = 'SET_REMOVED_OVERLAYS_VISIBILITY',
	TOGGLE_OVERLAY_PRESET = 'TOGGLE_OVERLAY_PRESET',
	SET_PRESET_OVERLAYS = 'SET_PRESET_OVERLAYS',
	ADD_ALERT_MSG = 'ADD_ALERT_MSG',
	REMOVE_ALERT_MSG = 'REMOVE_ALERT_MSG',
	TOGGLE_DRAGGED_MODE = 'TOGGLE_DRAGGED_MODE',
	SET_OVERLAY_TRANSLATION_DATA = 'SET_OVERLAY_TRANSLATION_DATA',
	SET_OVERLAYS_TRANSLATION_DATA = 'SET_OVERLAYS_TRANSLATION_DATA',
	SET_OVERLAYS_SCANNED_AREA_DATA = 'SET_OVERLAYS_SCANNED_AREA_DATA',
	ACTIVATE_SCANNED_AREA = 'ACTIVATE_SCANNED_AREA'
}


export type OverlayStatusActions = BackToWorldView | BackToWorldSuccess | ToggleFavoriteAction |
	SetFavoriteOverlaysAction | TogglePresetOverlayAction | SetPresetOverlaysAction |
	ActivateScannedAreaAction | SetOverlaysScannedAreaDataAction;

export class ActivateScannedAreaAction implements Action {
	type: string = OverlayStatusActionsTypes.ACTIVATE_SCANNED_AREA;

	constructor() {
	}
}

export class SetOverlaysScannedAreaDataAction implements Action {
	type: string = OverlayStatusActionsTypes.SET_OVERLAYS_SCANNED_AREA_DATA;

	constructor(public payload: IOverlaysScannedAreaData) {
	}
}

export class BackToWorldView implements Action {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW;

	constructor(public payload: { mapId: string }) {

	}
}

export class BackToWorldSuccess extends BackToWorldView {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS;
}

export class ToggleFavoriteAction implements Action {
	type: string = OverlayStatusActionsTypes.TOGGLE_OVERLAY_FAVORITE;

	constructor(public payload: { id: string, value: boolean, overlay?: IOverlay }) {
	}
}

export class SetFavoriteOverlaysAction implements Action {
	type = OverlayStatusActionsTypes.SET_FAVORITE_OVERLAYS;

	constructor(public payload: IOverlay[]) {
	}
}

export class SetRemovedOverlaysIdsAction implements Action {
	type = OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS;

	constructor(public payload: string[]) {

	}
}

export class ResetRemovedOverlaysIdsAction implements Action {
	type = OverlayStatusActionsTypes.RESET_REMOVED_OVERLAY_IDS;
}

export class SetRemovedOverlaysIdAction implements Action {
	type = OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_ID;

	constructor(public payload: { mapId: string, id: string, value: boolean }) {

	}
}

export class SetRemovedOverlaysVisibilityAction implements Action {
	type = OverlayStatusActionsTypes.SET_REMOVED_OVERLAYS_VISIBILITY;

	constructor(public payload: boolean) {

	}
}

export class SetRemovedOverlayIdsCount implements Action {
	readonly type = OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS_COUNT;

	constructor(public payload: number) {
	}
}

export class TogglePresetOverlayAction implements Action {
	type: string = OverlayStatusActionsTypes.TOGGLE_OVERLAY_PRESET;

	constructor(public payload: { id: string, value: boolean, overlay?: any }) {
	}
}

export class SetPresetOverlaysAction implements Action {
	type = OverlayStatusActionsTypes.SET_PRESET_OVERLAYS;

	constructor(public payload: any[]) {
	}
}

export class AddAlertMsg implements Action {
	type = OverlayStatusActionsTypes.ADD_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}
}

export class RemoveAlertMsg implements Action {
	type = OverlayStatusActionsTypes.REMOVE_ALERT_MSG;

	constructor(public payload: { value: string, key: AlertMsgTypes }) {
	}
}

export class ToggleDraggedModeAction implements Action {
	type = OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE;

	constructor(public payload: { overlayId: string, dragged: boolean }) {
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
