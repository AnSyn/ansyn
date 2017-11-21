import { CoreActions, CoreActionTypes, SetToastMessageAction } from '../actions/core.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export interface ICoreState {
	toastMessage: IToastMessage;
}

export const coreInitialState: ICoreState = {
	toastMessage: null
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: (action as SetToastMessageAction).payload };

		default:
			return state;
	}
}

