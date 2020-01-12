import { Action, props, createAction } from '@ngrx/store';
import { AlertMsgTypes } from '../../../alerts/model';
import { IOverlay } from '../../models/overlay.model';
import { IOverlaysScannedAreaData, IOverlaysTranslationData, } from '../../../menu-items/cases/models/case.model';
import { IScannedArea } from '../reducers/overlay-status.reducer';


export enum OverlayStatusActionsTypes {
	BACK_TO_WORLD_VIEW = 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS = 'BACK_TO_WORLD_SUCCESS',
	BACK_TO_WORLD_FAILED = 'BACK_TO_WORLD_FAILED',
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
	SET_OVERLAY_SCANNED_AREA_DATA = 'SET_OVERLAY_SCANNED_AREA_DATA',
	SET_OVERLAYS_SCANNED_AREA_DATA = 'SET_OVERLAYS_SCANNED_AREA_DATA',
	ACTIVATE_SCANNED_AREA = 'ACTIVATE_SCANNED_AREA'
}


export type OverlayStatusActions =
	BackToWorldView
	| BackToWorldSuccess
	| BackToWorldFailed
	| ToggleFavoriteAction
	|
	SetFavoriteOverlaysAction
	| TogglePresetOverlayAction
	| SetPresetOverlaysAction
	|
	ActivateScannedAreaAction
	| SetOverlaysScannedAreaDataAction
	| SetOverlayScannedAreaDataAction
	| SetOverlayTranslationDataAction
	|
	SetOverlaysTranslationDataAction
	| ToggleDraggedModeAction;

export const ActivateScannedAreaAction = createAction(
											OverlayStatusActionsTypes.ACTIVATE_SCANNED_AREA
);

export const SetOverlayScannedAreaDataAction = createAction(
													OverlayStatusActionsTypes.SET_OVERLAY_SCANNED_AREA_DATA,
													props<IScannedArea>()
);

export const SetOverlaysScannedAreaDataAction = createAction(
													OverlayStatusActionsTypes.SET_OVERLAYS_SCANNED_AREA_DATA,
													props<IOverlaysScannedAreaData>()
);

export const BackToWorldView = createAction(
									OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW,
									props<{ mapId: string }>()
);

export const BackToWorldSuccess = createAction(
									OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS
);

export const BackToWorldFailed = createAction(
									OverlayStatusActionsTypes.BACK_TO_WORLD_FAILED,
									props<{ mapId: string, error: any }>()
);

export const ToggleFavoriteAction = createAction(
										OverlayStatusActionsTypes.TOGGLE_OVERLAY_FAVORITE,
										props<{ id: string, value: boolean, overlay?: IOverlay }>()
);

export const SetFavoriteOverlaysAction = createAction(
											OverlayStatusActionsTypes.SET_FAVORITE_OVERLAYS,
											props<{payload: IOverlay[]}>()
);

export const SetRemovedOverlaysIdsAction = createAction(
											OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS,
											props<{payload: string[]}>()
);

export const ResetRemovedOverlaysIdsAction = createAction(
												OverlayStatusActionsTypes.RESET_REMOVED_OVERLAY_IDS
);

export const SetRemovedOverlaysIdAction = createAction(
											OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_ID,
											props<{ mapId: string, id: string, value: boolean }>()
);

export const SetRemovedOverlaysVisibilityAction = createAction(
													OverlayStatusActionsTypes.SET_REMOVED_OVERLAYS_VISIBILITY,
													props<{payload: boolean}>()
);

export const SetRemovedOverlayIdsCount  = createAction(
											OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS_COUNT,
											props<{payload: number}>()
);

export const TogglePresetOverlayAction = createAction(
											OverlayStatusActionsTypes.TOGGLE_OVERLAY_PRESET,
											props<{ id: string, value: boolean, overlay?: any }>()
);

export const SetPresetOverlaysAction = createAction(
										OverlayStatusActionsTypes.SET_PRESET_OVERLAYS,
										props<{payload: any[]}>()
);

export const AddAlertMsg = createAction(
							OverlayStatusActionsTypes.ADD_ALERT_MSG,
							props<{ value: string, key: AlertMsgTypes }>()
);

export const RemoveAlertMsg = createAction(
								OverlayStatusActionsTypes.REMOVE_ALERT_MSG,
								props<{ value: string, key: AlertMsgTypes }>()
);

export const ToggleDraggedModeAction = createAction(
										OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE,
										props<{ mapId: string, overlayId: string, dragged: boolean }>()
);

export const SetOverlayTranslationDataAction = createAction(
												OverlayStatusActionsTypes.SET_OVERLAY_TRANSLATION_DATA,
												props<{ overlayId: string, offset: [number, number] }>()
);

export const SetOverlaysTranslationDataAction = createAction(
													OverlayStatusActionsTypes.SET_OVERLAYS_TRANSLATION_DATA,
													props<{payload: IOverlaysTranslationData}>()
);
