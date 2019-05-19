import { Action } from '@ngrx/store';
import { IOverlay } from '../../models/overlay.model';


export enum OverlayStatusActionsTypes {
	BACK_TO_WORLD_VIEW = 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS = 'BACK_TO_WORLD_SUCCESS',
	SET_FAVORITE_OVERLAYS = 'SET_FAVORITE_OVERLAYS',
	TOGGLE_OVERLAY_FAVORITE = 'TOGGLE_OVERLAY_FAVORITE',
	TOGGLE_OVERLAY_PRESET = 'TOGGLE_OVERLAY_PRESET',
	SET_PRESET_OVERLAYS = 'SET_PRESET_OVERLAYS',
}

export type OverlayStatusActions = BackToWorldView | BackToWorldSuccess | ToggleFavoriteAction |
	SetFavoriteOverlaysAction | TogglePresetOverlayAction | SetPresetOverlaysAction;

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
