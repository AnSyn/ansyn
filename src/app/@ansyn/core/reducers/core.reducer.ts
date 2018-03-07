import {
	CoreActions, CoreActionTypes, SetFavoriteOverlaysAction, SetToastMessageAction
} from '../actions/core.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Overlay, OverlaysCriteria } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';

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
	overlaysCriteria: OverlaysCriteria;
	layout: LayoutKey;
}

export const coreInitialState: ICoreState = {
	toastMessage: null,
	favoriteOverlays: [],
	alertMsg: new Map([
		[AlertMsgTypes.OverlayIsNotPartOfCase, new Set()],
		[AlertMsgTypes.OverlaysOutOfBounds, new Set()]
	]),
	overlaysCriteria: {},
	layout: 'layout1'
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions | any): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: (action as SetToastMessageAction).payload };

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		case  CoreActionTypes.UPDATE_ALERT_MSG:
			const updatedMap = new Map(state.alertMsg);
			updatedMap.set(<AlertMsgTypes>action.payload.key, <Set<string>>action.payload.value);
			return { ...state, alertMsg: updatedMap };

		case  CoreActionTypes.SET_OVERLAYS_CRITERIA:
			const overlaysCriteria = { ...state.overlaysCriteria, ...action.payload };
			return { ...state, overlaysCriteria };

		case CoreActionTypes.SET_LAYOUT:
			return {...state, layout: action.payload };

		default:
			return state;
	}
}

