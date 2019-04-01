import { Action } from '@ngrx/store';
import { IOverlaysCriteria, IOverlaysCriteriaOptions } from '@ansyn/imagery';
import { IContext } from '../models/context.model';

export enum CoreActionTypes {
	CLEAR_ACTIVE_INTERACTIONS = '[Core] CLEAR_ACTIVE_INTERACTIONS',
	SET_OVERLAYS_CRITERIA = 'SET_OVERLAYS_CRITERIA',
	GO_ADJACENT_OVERLAY = 'GO_ADJACENT_OVERLAY',
	GO_NEXT_PRESET_OVERLAY = 'GO_NEXT_PRESET_OVERLAY',
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
	UPDATE_OVERLAY_COUNT = 'UPDATE_OVERLAY_COUNT',
	SET_AUTO_SAVE = 'SET_AUTO_SAVE',
	CHANGE_IMAGERY_MAP = '[Core] CHANGE_IMAGERY_MAP',

	/* @todo: remove contexts actions */
	ADD_ALL_CONTEXT = '[Context] Add All Contexts',
	SET_CONTEXT_PARAMS = '[Context] Set context params'
}

export type CoreActions =
	| ClearActiveInteractionsAction
	| GoAdjacentOverlay
	| GoNextPresetOverlay
	| UpdateOverlaysCountAction

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

export class SetAutoSave implements Action {
	readonly type = CoreActionTypes.SET_AUTO_SAVE;

	constructor(public payload: boolean) {
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
