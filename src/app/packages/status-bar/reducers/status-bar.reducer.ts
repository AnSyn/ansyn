import { StatusActions, StatusBarActionsTypes } from '../actions/status-bar.actions';
import { MapsLayout } from '@ansyn/core';

export interface IToastMessage {
	toastText: string;
	showWarningIcon?: boolean;
}

export interface IStatusBarState {
	layouts: MapsLayout[];
	selected_layout_index: number;
	flags: Map<string, boolean>;
	toastMessage: IToastMessage,
	orientations: string[],
	geoFilters: string[],
	orientation: string;
	geoFilter: string;
	time: { from: Date, to: Date },
	overlays_count: number,
	overlayNotInCase: boolean
}

export const statusBarFlagsItems = {
	pinPointIndicator: 'PIN_POINT_INDICATOR',
	pinPointSearch: 'PIN_POINT_SEARCH',
	geo_registered_options_enabled: 'geo_registered_options_enabled'
};

export const statusBarToastMessages = {
	showLinkCopyToast: 'Link copied to clipboard',
	showOverlayErrorToast: 'Failed to load overlay'
};

const layouts: MapsLayout[] = [
	{ id: 'layout1', description: 'full screen', maps_count: 1 },
	{ id: 'layout2', description: '2 maps full', maps_count: 2 },
	{ id: 'layout3', description: 'full', maps_count: 2 },
	{ id: 'layout4', description: 'full', maps_count: 3 },
	{ id: 'layout5', description: 'full', maps_count: 3 },
	{ id: 'layout6', description: 'full', maps_count: 4 }
];

const selected_layout_index = 0;

export const StatusBarInitialState: IStatusBarState = {
	layouts,
	selected_layout_index,
	flags: new Map<string, boolean>(),
	toastMessage: null,
	orientations: ['original'],
	geoFilters: ['pin-point'],
	orientation: 'original',
	geoFilter: 'pin-point',
	time: { from: new Date(0), to: new Date() },
	overlays_count: 0,
	overlayNotInCase: false
};

export function StatusBarReducer(state = StatusBarInitialState, action: StatusActions): IStatusBarState {
	switch (action.type) {

		case StatusBarActionsTypes.MAP_GEO_ENABLED_MODE_CHANGED:
			const tmpMap = new Map(state.flags);
			tmpMap.set(statusBarFlagsItems.geo_registered_options_enabled, action.payload);
			return { ...state, flags: tmpMap };

		case StatusBarActionsTypes.CHANGE_LAYOUT:
			return Object.assign({}, state, { selected_layout_index: action.payload });

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
			return { ...state, overlays_count: action.payload };

		case StatusBarActionsTypes.SET_NOT_FROM_CASE_OVERLAY:
			return { ...state, overlayNotInCase: action.payload };

		default:
			return state;

	}
}

