import { StatusBarActions, StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IComboBoxesProperties } from '../models/combo-boxes.model';
import { CaseGeoFilter } from '../../menu-items/cases/models/case.model';

export interface IGeoFilterStatus {
	type: CaseGeoFilter;
	active: boolean;
}

export interface IStatusBarState {
	geoFilterStatus: IGeoFilterStatus;
	comboBoxesProperties: IComboBoxesProperties;
}

export const StatusBarInitialState: IStatusBarState = {
	geoFilterStatus: {
		type: CaseGeoFilter.PinPoint,
		active: false
	},
	comboBoxesProperties: {}
};

export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector: MemoizedSelector<any, IStatusBarState> = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusBarActions | any): IStatusBarState {
	switch (action.type) {
		case StatusBarActionsTypes.SET_IMAGE_OPENING_ORIENTATION:
			return { ...state, comboBoxesProperties: { ...state.comboBoxesProperties, ...action.payload } };

		case StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS:
			return { ...state, geoFilterStatus: { ...state.geoFilterStatus, ...action.payload } };

		default:
			return state;

	}
}

export const selectComboBoxesProperties = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.comboBoxesProperties : StatusBarInitialState.comboBoxesProperties);
export const selectGeoFilterStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.geoFilterStatus : StatusBarInitialState.geoFilterStatus);
export const selectGeoFilterActive = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.active);
export const selectGeoFilterType = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.type);
