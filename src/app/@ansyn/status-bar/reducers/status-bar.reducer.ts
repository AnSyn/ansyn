import { StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IComboBoxesProperties } from '../models/combo-boxes.model';
import { StatusBarActions } from '../actions/status-bar.actions';
import { SearchMode, SearchModeEnum } from '../models/search-mode.enum';

export interface IGeoFilterStatus {
	searchMode: SearchMode;
	indicator: boolean;
}

export interface IStatusBarState {
	geoFilterStatus: IGeoFilterStatus;
	comboBoxesProperties: IComboBoxesProperties;
}

export const StatusBarInitialState: IStatusBarState = {
	geoFilterStatus: {
		searchMode: SearchModeEnum.none,
		indicator: true
	},
	comboBoxesProperties: {}
};

export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector: MemoizedSelector<any, IStatusBarState> = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusBarActions | any ): IStatusBarState {
	switch (action.type) {
		case StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES:
			return { ...state, comboBoxesProperties: { ...state.comboBoxesProperties, ...action.payload } };

		case StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS:
			return { ...state, geoFilterStatus: { ...state.geoFilterStatus, ...action.payload } };

		default:
			return state;

	}
}
export const selectComboBoxesProperties = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.comboBoxesProperties : StatusBarInitialState.comboBoxesProperties);
export const selectGeoFilterStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.geoFilterStatus : StatusBarInitialState.geoFilterStatus);
export const selectGeoFilterIndicator = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.indicator);
export const selectGeoFilterSearchMode = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.searchMode);
