import { Action } from '@ngrx/store';


export const OverlayStatusActionsTypes = {
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	BACK_TO_WORLD_SUCCESS: 'BACK_TO_WORLD_SUCCESS',
};

export type OverlayStatusActions = BackToWorldView | BackToWorldSuccess;

export class BackToWorldView implements Action {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW;

	constructor(public payload: { mapId: string }) {

	}
}

export class BackToWorldSuccess extends BackToWorldView {
	type = OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS;
}
