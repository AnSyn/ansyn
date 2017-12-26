import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';
import { IToastMessage } from '../reducers/core.reducer';

export const CoreActionTypes = {
	TOGGLE_MAP_LAYERS: type('TOGGLE_MAP_LAYERS'),
	TOGGLE_OVERLAY_FAVORITE: type('TOGGLE_FAVORITE'),
	SET_TOAST_MESSAGE: type('SET_TOAST_MESSAGE'),
	SET_FAVORITE_OVERLAYS: type('SET_FAVORITE_OVERLAYS')
};

export type CoreActions =
	ToggleMapLayersAction
	| ToggleFavoriteAction
	| SetToastMessageAction
	| SetFavoriteOverlaysAction;

export class ToggleMapLayersAction implements Action {
	type = CoreActionTypes.TOGGLE_MAP_LAYERS;

	constructor(public payload: { mapId: string }) {
	}
}

export class ToggleFavoriteAction implements Action {
	type: string = CoreActionTypes.TOGGLE_OVERLAY_FAVORITE;

	constructor(public payload?: string) { // overlayId
	}
}

export class SetToastMessageAction implements Action {
	type = CoreActionTypes.SET_TOAST_MESSAGE;

	constructor(public payload?: IToastMessage) {
	}
}

export class SetFavoriteOverlaysAction implements Action {
	type = CoreActionTypes.SET_FAVORITE_OVERLAYS;

	constructor(public payload: string[]) {
	}
}
