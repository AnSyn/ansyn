import { StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { ComboBoxesProperties } from '../models/combo-boxes.model';
import { StatusBarActions } from '@ansyn/status-bar/actions/status-bar.actions';
import { CaseGeoFilter } from '@ansyn/core/models/case.model';

export const statusBarToastMessages = {
	showLinkCopyToast: 'Link copied to clipboard',
	showOverlayErrorToast: 'Failed to load overlay'
};

declare module '@ansyn/core/models/case.model' {
	export enum CaseGeoFilter {
		none = ''
	}
}

export interface GeoFilterStatus {
	searchMode: CaseGeoFilter;
	indicator: boolean;
}

export interface IStatusBarState {
	geoFilterStatus: GeoFilterStatus;
	comboBoxesProperties: ComboBoxesProperties;
}

export const StatusBarInitialState: IStatusBarState = {
	geoFilterStatus: {
		searchMode: CaseGeoFilter.none,
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
			// const indicator = Boolean(action.payload.hasOwnProperty('searchMode') && action.payload.searchMode) || ;
			return { ...state, geoFilterStatus: { ...state.geoFilterStatus, ...action.payload } };

		default:
			return state;

	}
}
export const selectComboBoxesProperties = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.comboBoxesProperties : StatusBarInitialState.comboBoxesProperties);
export const selectGeoFilterStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.geoFilterStatus : StatusBarInitialState.geoFilterStatus);
export const selectGeoFilterIndicator = createSelector(selectGeoFilterStatus, (geoFilterStatus: GeoFilterStatus) => geoFilterStatus.indicator);
export const selectGeoFilterSearchMode = createSelector(selectGeoFilterStatus, (geoFilterStatus: GeoFilterStatus) => geoFilterStatus.searchMode);
