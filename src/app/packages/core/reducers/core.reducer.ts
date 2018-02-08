import {
	CoreActions, CoreActionTypes, SetFavoriteOverlaysAction, SetToastMessageAction,
	UpdateFavoriteOverlaysMetadataAction
} from '../actions/core.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Overlay } from '../models/overlay.model';

export enum AlertMsgTypes {
	'OverlaysOutOfBounds', 'OverlayIsNotPartOfCase'
}

export type AlertMsg = Map<AlertMsgTypes, Set<string>>;

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export interface ICoreState {
	toastMessage: IToastMessage;
	favoriteOverlays: Overlay[];
	alertMsg: AlertMsg;
}

export const coreInitialState: ICoreState = {
	toastMessage: null,
	favoriteOverlays: [],
	alertMsg: new Map([
		[AlertMsgTypes.OverlayIsNotPartOfCase, new Set()],
		[AlertMsgTypes.OverlaysOutOfBounds, new Set()]
	])
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions | any): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: (action as SetToastMessageAction).payload };

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		case CoreActionTypes.UPDATE_FAVORITE_OVERLAYS_METADATA:
			return { ...state, favoriteOverlays: (action as UpdateFavoriteOverlaysMetadataAction).payload };

		case  CoreActionTypes.UPDATE_ALERT_MSG:
			const updatedMap = new Map(state.alertMsg);
			updatedMap.set(<AlertMsgTypes>action.payload.key, <Set<string>>action.payload.value);
			return { ...state, alertMsg: updatedMap };

		default:
			return state;
	}
}

