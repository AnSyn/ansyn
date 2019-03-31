import { Action } from '@ngrx/store';
import { IOverlay, IOverlaysCriteria, IOverlaysCriteriaOptions } from '../../../../imagery/model/overlay.model';
import { IContext } from '../models/context.model';

export enum CoreActionTypes {
	TOGGLE_OVERLAY_FAVORITE = '[Core] TOGGLE_FAVORITE',
	TOGGLE_OVERLAY_PRESET = '[Core] TOGGLE_OVERLAY_PRESET',
	SET_FAVORITE_OVERLAYS = '[Core] SET_FAVORITE_OVERLAYS',
	SET_PRESET_OVERLAYS = '[Core] SET_PRESET_OVERLAYS',
	CLEAR_ACTIVE_INTERACTIONS = '[Core] CLEAR_ACTIVE_INTERACTIONS',
	SET_OVERLAYS_CRITERIA = 'SET_OVERLAYS_CRITERIA',
	GO_ADJACENT_OVERLAY = 'GO_ADJACENT_OVERLAY',
	GO_NEXT_PRESET_OVERLAY = 'GO_NEXT_PRESET_OVERLAY',
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
	UPDATE_OVERLAY_COUNT = 'UPDATE_OVERLAY_COUNT',
	SET_AUTO_SAVE = 'SET_AUTO_SAVE',
	SET_REMOVED_OVERLAY_IDS = 'SET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAY_ID = 'SET_REMOVED_OVERLAY_ID',
	RESET_REMOVED_OVERLAY_IDS = 'RESET_REMOVED_OVERLAY_IDS',
	SET_REMOVED_OVERLAYS_VISIBILITY = 'SET_REMOVED_OVERLAYS_VISIBILITY',
	SET_REMOVED_OVERLAY_IDS_COUNT = 'SET_REMOVED_OVERLAY_IDS_COUNT',
	CHANGE_IMAGERY_MAP = '[Core] CHANGE_IMAGERY_MAP',

	/* @todo: remove contexts actions */
	ADD_ALL_CONTEXT = '[Context] Add All Contexts',
	SET_CONTEXT_PARAMS = '[Context] Set context params'
}

export type CoreActions =
	| ToggleFavoriteAction
	| TogglePresetOverlayAction
	| SetFavoriteOverlaysAction
	| SetPresetOverlaysAction
	| ClearActiveInteractionsAction
	| GoAdjacentOverlay
	| GoNextPresetOverlay
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

export class SetOverlaysCriteriaAction implements Action {
	type = CoreActionTypes.SET_OVERLAYS_CRITERIA;

	constructor(public payload: IOverlaysCriteria,
				public options: IOverlaysCriteriaOptions = null) {
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

	constructor(public payload: { mapId: string, id: string, value: boolean }) {

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

export class SetRemovedOverlayIdsCount implements Action {
	readonly type = CoreActionTypes.SET_REMOVED_OVERLAY_IDS_COUNT;

	constructor(public payload: number) {
	}
}
export class ChangeImageryMap implements Action {
	readonly type = CoreActionTypes.CHANGE_IMAGERY_MAP;

	constructor(public payload: { id: string, mapType: string, sourceType?: string }) {
	}
}

/* @todo: remove contexts actions */
export enum ContextActionTypes {
	ADD_ALL_CONTEXT = '[Context] Add All Contexts',
	SET_CONTEXT_PARAMS = '[Context] Set context params'
}


export class AddAllContextsAction {
	readonly type = ContextActionTypes.ADD_ALL_CONTEXT;

	constructor(public payload: IContext[]) {
	}
}

export class SetContextParamsAction {
	readonly type = ContextActionTypes.SET_CONTEXT_PARAMS;

	constructor(public payload: Partial<any>) {
	}
}
