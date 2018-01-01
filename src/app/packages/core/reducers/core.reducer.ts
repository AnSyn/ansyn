import {
	CoreActions,
	CoreActionTypes,
	SetFavoriteOverlaysAction,
	SetToastMessageAction
} from '../actions/core.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Overlay } from '../models/overlay.model';

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export interface ICoreState {
	toastMessage: IToastMessage;
	favoriteOverlays: Overlay[]
}

export const coreInitialState: ICoreState = {
	toastMessage: null,
	favoriteOverlays: []
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: (action as SetToastMessageAction).payload };

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		default:
			return state;
	}
}

