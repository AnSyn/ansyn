import { StatusActions, StatusBarActionsTypes } from '../actions/status-bar.actions';
import { MapsLayout } from '@ansyn/core';
import { createFeatureSelector } from '@ngrx/store';

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export interface IStatusBarState {
	layouts: MapsLayout[];
	selectedLayoutIndex: number;
	flags: Map<string, boolean>;
	toastMessage: IToastMessage,
	orientations: string[],
	geoFilters: string[],
	orientation: string;
	geoFilter: string;
	time: { from: Date, to: Date },
	overlaysCount: number,
	overlayNotInCase: boolean
}

export const statusBarFlagsItems = {
	pinPointIndicator: 'PIN_POINT_INDICATOR',
	pinPointSearch: 'PIN_POINT_SEARCH',
	geoRegisteredOptionsEnabled: 'geoRegisteredOptionsEnabled'
};

export const statusBarToastMessages = {
	showLinkCopyToast: 'Link copied to clipboard',
	showOverlayErrorToast: 'Failed to load overlay'
};

const layouts: MapsLayout[] = [
	{ id: 'layout1', description: 'full screen', mapsCount: 1 },
	{ id: 'layout2', description: '2 maps full', mapsCount: 2 },
	{ id: 'layout3', description: 'full', mapsCount: 2 },
	{ id: 'layout4', description: 'full', mapsCount: 3 },
	{ id: 'layout5', description: 'full', mapsCount: 3 },
	{ id: 'layout6', description: 'full', mapsCount: 4 }
];

const selectedLayoutIndex = 0;

export const StatusBarInitialState: IStatusBarState = {
	layouts,
	selectedLayoutIndex,
	flags: new Map<string, boolean>(),
	toastMessage: null,
	orientations: ['original'],
	geoFilters: ['pin-point'],
	orientation: 'original',
	geoFilter: 'pin-point',
	time: { from: new Date(0), to: new Date() },
	overlaysCount: 0,
	overlayNotInCase: false
};
export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusActions): IStatusBarState {
	switch (action.type) {

		case StatusBarActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED:
			const tmpMap = new Map(state.flags);
			tmpMap.set(statusBarFlagsItems.geoRegisteredOptionsEnabled, action.payload);
			return { ...state, flags: tmpMap };

		case StatusBarActionsTypes.CHANGE_LAYOUT:
			return Object.assign({}, state, { selectedLayoutIndex: action.payload });

		case StatusBarActionsTypes.COPY_SELECTED_CASE_LINK:
			return Object.assign({}, state);

		case StatusBarActionsTypes.UPDATE_STATUS_FLAGS:
			const items = Object.keys(statusBarFlagsItems).map(k => statusBarFlagsItems[k]);
			if (!items.includes(action.payload.key)) {
				return state;
			}

			const newMap = new Map(state.flags);

			if (!newMap.get(action.payload.key)) {
				newMap.set(action.payload.key, false);
			}

			const value = action.payload.value !== undefined ? action.payload.value : !newMap.get(action.payload.key);

			newMap.set(action.payload.key, value);

			return { ...state, flags: newMap };

		case StatusBarActionsTypes.SET_TOAST_MESSAGE:
			if (!action.payload) {
				return { ...state, toastMessage: null };
			}
			return { ...state, toastMessage: action.payload };

		case StatusBarActionsTypes.SET_ORIENTATION:
			return { ...state, orientation: action.payload };

		case StatusBarActionsTypes.SET_GEO_FILTER:
			return { ...state, geoFilter: action.payload };

		case StatusBarActionsTypes.SET_TIME:
			return { ...state, time: action.payload };

		case StatusBarActionsTypes.SET_OVERLAYS_COUNT:
			return { ...state, overlaysCount: action.payload };

		case StatusBarActionsTypes.SET_NOT_FROM_CASE_OVERLAY:
			return { ...state, overlayNotInCase: action.payload };

		default:
			return state;

	}
}

