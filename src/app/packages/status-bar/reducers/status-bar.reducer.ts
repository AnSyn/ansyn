import { StatusActions, StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { ComboBoxesProperties } from '@ansyn/status-bar';
import { StatusBarFlag, statusBarFlagsItems } from '@ansyn/status-bar/models/status-bar-flag-items.model';

export const statusBarToastMessages = {
	showLinkCopyToast: 'Link copied to clipboard',
	showOverlayErrorToast: 'Failed to load overlay'
};

export interface IStatusBarState {
	selectedLayoutIndex: number;
	flags: Map<StatusBarFlag, boolean>;
	comboBoxesProperties: ComboBoxesProperties,
	time: { from: Date, to: Date },
	overlaysCount: number,
	overlayNotInCase: boolean
}

export const StatusBarInitialState: IStatusBarState = {
	selectedLayoutIndex: 0,
	flags: new Map<StatusBarFlag, boolean>(),
	comboBoxesProperties: {},
	time: { from: new Date(0), to: new Date() },
	overlaysCount: 0,
	overlayNotInCase: false
};
export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector: MemoizedSelector<any, IStatusBarState> = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusActions): IStatusBarState {
	switch (action.type) {
		case StatusBarActionsTypes.CHANGE_LAYOUT:
			return Object.assign({}, state, { selectedLayoutIndex: action.payload });

		case StatusBarActionsTypes.COPY_SELECTED_CASE_LINK:
			return Object.assign({}, state);

		case StatusBarActionsTypes.UPDATE_STATUS_FLAGS:
			const items = Object.keys(statusBarFlagsItems).map(k => statusBarFlagsItems[k]);
			if (!items.includes(action.payload.key)) {
				throw new Error(`action.payload.key: ${action.payload.key} does not exit in statusBarFlagsItems.`);
			}

			const newMap = new Map(state.flags);

			const value = typeof action.payload.value !== 'undefined' ? action.payload.value : !newMap.get(action.payload.key);

			newMap.set(action.payload.key, value);

			return { ...state, flags: newMap };

		case StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES:
			return { ...state, comboBoxesProperties: { ...state.comboBoxesProperties, ...action.payload } };

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

