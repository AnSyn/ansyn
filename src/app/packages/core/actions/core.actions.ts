import { Action } from '@ngrx/store';
import { type } from '@ansyn/core/utils/type';

export const CoreActionTypes = {
	TOGGLE_MAP_LAYERS: type('TOGGLE_MAP_LAYERS'),
	TOGGLE_OVERLAY_FAVORITE: type('TOGGLE_FAVORITE')
};

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
