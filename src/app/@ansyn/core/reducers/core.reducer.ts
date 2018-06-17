import {
	CoreActions,
	CoreActionTypes,
	SetFavoriteOverlaysAction,
	SetToastMessageAction
} from '../actions/core.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { Overlay, OverlaysCriteria } from '../models/overlay.model';
import { LayoutKey } from '../models/layout-options.model';
import { sessionData } from '../services/core-session.service';
import { CaseDataInputFiltersState, CasePreview } from '@ansyn/core/models/case.model';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';


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
	favoriteOverlays: Overlay[];
	alertMsg: AlertMsg;
	overlaysCriteria: OverlaysCriteria;
	layout: LayoutKey;
	wasWelcomeNotificationShown: boolean;
	selectedCase: CasePreview;
}

export const coreInitialState: ICoreState = {
	toastMessage: null,
	favoriteOverlays: [],
	alertMsg: new Map([
		[AlertMsgTypes.overlayIsNotPartOfQuery, new Set()],
		[AlertMsgTypes.OverlaysOutOfBounds, new Set()]
	]),
	overlaysCriteria: {},
	wasWelcomeNotificationShown: sessionData().wasWelcomeNotificationShown,
	layout: 'layout1',
	selectedCase: null
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(coreState = coreInitialState, action: CoreActions | any): ICoreState {
	switch (action.type) {
		case CoreActionTypes.SET_TOAST_MESSAGE:
			return { ...coreState, toastMessage: (action as SetToastMessageAction).payload };

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...coreState, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		case  CoreActionTypes.ADD_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(coreState .alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.add(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...coreState, alertMsg };
		}

		case  CoreActionTypes.REMOVE_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(coreState .alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.delete(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...coreState, alertMsg };
		}

		case  CoreActionTypes.SET_OVERLAYS_CRITERIA:
			const overlaysCriteria = { ...coreState.overlaysCriteria, ...action.payload };
			return { ...coreState, overlaysCriteria };

		case CoreActionTypes.SET_LAYOUT:
			return { ...coreState, layout: action.payload };

		case CoreActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG:
			const payloadObj = { wasWelcomeNotificationShown: action.payload };
			return { ...coreState, ...payloadObj };

		case CoreActionTypes.SELECT_CASE: {
			const { state, ...casePreview } = action.payload;
			return { ...coreState, selectedCase: casePreview };
		}

		default:
			return coreState;
	}
}

export const selectFavoriteOverlays = createSelector(coreStateSelector, (core) => core.favoriteOverlays);
export const selectLayout = createSelector(coreStateSelector, (core) => core.layout);
export const selectOverlaysCriteria = createSelector(coreStateSelector, (core) => core.overlaysCriteria);
export const selectDataInputFilter = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria.dataInputFilters);
export const selectSelectedCase = createSelector(coreStateSelector, (core) => core.selectedCase);
