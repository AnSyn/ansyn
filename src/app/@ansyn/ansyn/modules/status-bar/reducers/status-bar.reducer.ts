import { StatusBarActions, StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IComboBoxesProperties } from '../models/combo-boxes.model';
import { SearchMode, SearchModeEnum } from '../models/search-mode.enum';
import { CoreActionTypes } from '@ansyn/core';
import { IMapState, mapStateSelector } from "@ansyn/map-facade";

export interface IGeoFilterStatus {
	searchMode: SearchMode;
	indicator: boolean;
}

export interface IStatusBarState {
	geoFilterStatus: IGeoFilterStatus;
	comboBoxesProperties: IComboBoxesProperties;
	mapsExtraDescriptions: Map<string, string>;
}

export const StatusBarInitialState: IStatusBarState = {
	geoFilterStatus: {
		searchMode: SearchModeEnum.none,
		indicator: true
	},
	comboBoxesProperties: {},
	mapsExtraDescriptions: new Map<string, string>()
};

export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector: MemoizedSelector<any, IStatusBarState> = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusBarActions | any): IStatusBarState {
	switch (action.type) {
		case StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES:
			return { ...state, comboBoxesProperties: { ...state.comboBoxesProperties, ...action.payload } };

		case StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS:
			return { ...state, geoFilterStatus: { ...state.geoFilterStatus, ...action.payload } };

		case CoreActionTypes.SET_MAP_EXTRA_DESCRIPTION: {
			const { id, extraDescription } = action.payload;
			const mapsExtraDescriptions = new Map<string, string>(state.mapsExtraDescriptions);
			mapsExtraDescriptions.set(id, extraDescription);
			return { ...state, mapsExtraDescriptions };
		}
		default:
			return state;

	}
}

export const selectComboBoxesProperties = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.comboBoxesProperties : StatusBarInitialState.comboBoxesProperties);
export const selectGeoFilterStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.geoFilterStatus : StatusBarInitialState.geoFilterStatus);
export const selectGeoFilterIndicator = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.indicator);
export const selectGeoFilterSearchMode = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.searchMode);
export const selectMapsExtraDescriptions = createSelector(statusBarStateSelector, (map: IStatusBarState) => map.mapsExtraDescriptions);
