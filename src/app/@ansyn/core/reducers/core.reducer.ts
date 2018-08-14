import {
	CoreActions,
	CoreActionTypes,
	EnableCopyOriginalOverlayDataAction,
	SetFavoriteOverlaysAction,
	SetPresetOverlaysAction,
	SetToastMessageAction
} from '../actions/core.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IOverlay, IOverlaysCriteria } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';
import { sessionData } from '../services/core-session.service';
import { uniq } from 'lodash';

export enum AlertMsgTypes {
	OverlaysOutOfBounds = 'overlaysOutOfBounds',
	overlayIsNotPartOfQuery = 'overlayIsNotPartOfQuery'
}

export type AlertMsg = Map<AlertMsgTypes, Set<string>>;

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export interface ICoreState {
	toastMessage: IToastMessage;
	favoriteOverlays: IOverlay[];
	removedOverlaysIds: string[];
	removedOverlaysVisibility: boolean;
	presetOverlays: IOverlay[];
	alertMsg: AlertMsg;
	overlaysCriteria: IOverlaysCriteria;
	layout: LayoutKey;
	wasWelcomeNotificationShown: boolean;
	enableCopyOriginalOverlayData: boolean;
	autoSave: boolean;
}

export const coreInitialState: ICoreState = {
	toastMessage: null,
	favoriteOverlays: [],
	removedOverlaysIds: [],
	removedOverlaysVisibility: true,
	presetOverlays: [],
	alertMsg: new Map([
		[AlertMsgTypes.overlayIsNotPartOfQuery, new Set()],
		[AlertMsgTypes.OverlaysOutOfBounds, new Set()]
	]),
	overlaysCriteria: {},
	wasWelcomeNotificationShown: sessionData().wasWelcomeNotificationShown,
	layout: 'layout1',
	autoSave: false,
	enableCopyOriginalOverlayData: false
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions | any): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...state, toastMessage: (action as SetToastMessageAction).payload };

		case CoreActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA:
			return { ...state, enableCopyOriginalOverlayData: (action as EnableCopyOriginalOverlayDataAction).payload };

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		case CoreActionTypes.SET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: action.payload };

		case CoreActionTypes.SET_REMOVED_OVERLAY_ID:
			const { id, value } = action.payload;
			const removedOverlaysIds = value ? uniq([...state.removedOverlaysIds, id]) : state.removedOverlaysIds.filter(_id => id !== _id);
			return { ...state, removedOverlaysIds };

		case CoreActionTypes.RESET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: [] };

		case CoreActionTypes.SET_REMOVED_OVERLAYS_VISIBILITY:
			return { ...state, removedOverlaysVisibility: action.payload };

		case CoreActionTypes.SET_PRESET_OVERLAYS:
			return { ...state, presetOverlays: (action as SetPresetOverlaysAction).payload };

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
			const payloadObj = { wasWelcomeNotificationShown: action.payload };
			return { ...state, ...payloadObj };

		case CoreActionTypes.SET_AUTO_SAVE:
			return { ...state, autoSave: action.payload };

		default:
			return state;
	}
}

export const selectFavoriteOverlays = createSelector(coreStateSelector, (core) => core.favoriteOverlays);
export const selectRemovedOverlays = createSelector(coreStateSelector, (core) => core.removedOverlaysIds);
export const selectRemovedOverlaysVisibility = createSelector(coreStateSelector, (core) => core.removedOverlaysVisibility);
export const selectPresetOverlays = createSelector(coreStateSelector, (core) => core.presetOverlays);
export const selectLayout = createSelector(coreStateSelector, (core) => core.layout);
export const selectOverlaysCriteria = createSelector(coreStateSelector, (core) => core.overlaysCriteria);
export const selectDataInputFilter = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria.dataInputFilters);
export const selectRegion = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria && overlayCriteria.region);
export const selectEnableCopyOriginalOverlayDataFlag = createSelector(coreStateSelector, (core) => core.enableCopyOriginalOverlayData);
export const selectAutoSave = createSelector(coreStateSelector, (core) => core.autoSave);
