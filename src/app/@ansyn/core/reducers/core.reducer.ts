import {
	CoreActions, CoreActionTypes, SetFavoriteOverlaysAction,
	SetToastMessageAction
} from '../actions/core.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Overlay, OverlaysCriteria } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';
import { sessionData } from '../services/core-session.service';

export enum AlertMsgTypes {
	OverlaysOutOfBounds = 'overlaysOutOfBounds',
	OverlayIsNotPartOfCase = 'overlayIsNotPartOfCase'
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
	overlaysCount: number;
	wasWelcomeNotificationShown: boolean;
}

export const coreInitialState: ICoreState = {
	toastMessage: null,
	favoriteOverlays: [],
	alertMsg: new Map([
		[AlertMsgTypes.OverlayIsNotPartOfCase, new Set()],
		[AlertMsgTypes.OverlaysOutOfBounds, new Set()]
	]),
	overlaysCriteria: {},
	layout: 'layout1',
	overlaysCount: 0,
	wasWelcomeNotificationShown: sessionData().wasWelcomeNotificationShown
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions | any): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: (action as SetToastMessageAction).payload };

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		case  CoreActionTypes.ADD_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(state.alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.add(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...state, alertMsg };
		}

		case  CoreActionTypes.REMOVE_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(state.alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.delete(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...state, alertMsg };
		}

		case  CoreActionTypes.SET_OVERLAYS_CRITERIA:
			const overlaysCriteria = { ...state.overlaysCriteria, ...action.payload };
			return { ...state, overlaysCriteria };

		case CoreActionTypes.SET_LAYOUT:
			return { ...state, layout: action.payload };

		case CoreActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG:
			const payloadObj = {wasWelcomeNotificationShown: action.payload};
			return {...state, ...payloadObj };

		case CoreActionTypes.SET_OVERLAYS_COUNT:
			return { ...state, overlaysCount: action.payload };

		case CoreActionTypes.SET_OVERLAYS_COUNT:
			return { ...state, overlaysCount: action.payload };

		default:
			return state;
	}
}

