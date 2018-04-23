import { StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { ComboBoxesProperties } from '@ansyn/status-bar';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { isNil } from 'lodash';
import { StatusBarActions } from '@ansyn/status-bar/actions/status-bar.actions';

export const statusBarToastMessages = {
	showLinkCopyToast: 'Link copied to clipboard',
	showOverlayErrorToast: 'Failed to load overlay'
};

export interface IStatusBarState {
	flags: Map<statusBarFlagsItemsEnum, boolean>;
	comboBoxesProperties: ComboBoxesProperties
}

export const StatusBarInitialState: IStatusBarState = {
	flags: new Map<statusBarFlagsItemsEnum, boolean>(),
	comboBoxesProperties: {}
};

export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector: MemoizedSelector<any, IStatusBarState> = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusBarActions | any ): IStatusBarState {
	switch (action.type) {
		case StatusBarActionsTypes.UPDATE_STATUS_FLAGS:
			const items = Object.keys(statusBarFlagsItemsEnum).map(k => statusBarFlagsItemsEnum[k]);
			if (!items.includes(action.payload.key)) {
				throw new Error(`action.payload.key: ${action.payload.key} does not exit in statusBarFlagsItems.`);
			}

			const newMap = new Map(state.flags);

			const value = !isNil(action.payload.value) ? action.payload.value : !newMap.get(action.payload.key);

			newMap.set(action.payload.key, value);
			if (action.payload.key === statusBarFlagsItemsEnum.geoFilterSearch && value) {
				newMap.set(statusBarFlagsItemsEnum.geoFilterIndicator, true);
			}
			return { ...state, flags: newMap };

		case StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES:
			return { ...state, comboBoxesProperties: { ...state.comboBoxesProperties, ...action.payload } };

		default:
			return state;

	}
}
export const selectGeoFilter = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar.comboBoxesProperties.geoFilter);
