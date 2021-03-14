import { StatusBarActions, StatusBarActionsTypes } from '../actions/status-bar.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { CaseGeoFilter } from '../../menu-items/cases/models/case.model';

export interface IGeoFilterStatus {
	type: CaseGeoFilter;
	active: boolean;
}

export interface IStatusBarState {
	geoFilterStatus?: IGeoFilterStatus;
	isCalenderOpen?: boolean;
	isAdvancedSearchOpen?: boolean;
	IsSimpleSearchOpen?: boolean;
	IsOpenedFromOutside?: boolean;
	markSecondSearchSensors?: boolean;
}

export const StatusBarInitialState: IStatusBarState = {
	geoFilterStatus: {
		type: CaseGeoFilter.PinPoint,
		active: false
	},
	isCalenderOpen: false,
	isAdvancedSearchOpen: false,
	IsSimpleSearchOpen: false,
	IsOpenedFromOutside: false,
	markSecondSearchSensors: false
};

export const statusBarFeatureKey = 'statusBar';
export const statusBarStateSelector: MemoizedSelector<any, IStatusBarState> = createFeatureSelector<IStatusBarState>(statusBarFeatureKey);

export function StatusBarReducer(state = StatusBarInitialState, action: StatusBarActions | any): IStatusBarState {
	switch (action.type) {
		case StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS: {
			const { payload } = action;
			if ( payload ) {
				return { ...state, geoFilterStatus: { ...state.geoFilterStatus, ...payload } };
			} else {
				return state;
			}
		}
		case StatusBarActionsTypes.UPDATE_CALENDER_STATUS: {
			const { payload } = action;
			return { ...state, isCalenderOpen: payload}
		}

		case StatusBarActionsTypes.TOGGLE_ADVANCED_SEARCH: {
			const { payload } = action;
			return { ...state, isAdvancedSearchOpen: payload}
		}
		case StatusBarActionsTypes.TOGGLE_SIMPLE_SEARCH: {
			const { payload } = action;
			return { ...state, IsSimpleSearchOpen: payload}
		}
		case StatusBarActionsTypes.OPENED_FROM_OUTSIDE: {
			const { payload } = action;
			return { ...state, IsOpenedFromOutside: payload}
		}
		case StatusBarActionsTypes.MARK_SECOND_SEARCH: {
			const { payload } = action;
			return { ...state, markSecondSearchSensors: payload}
		}

		default:
			return state;

	}
}

export const selectGeoFilterStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.geoFilterStatus : StatusBarInitialState.geoFilterStatus);
export const selectCalenderStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.isCalenderOpen : StatusBarInitialState.isCalenderOpen);
export const selectAdvancedSearchStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.isAdvancedSearchOpen : StatusBarInitialState.isAdvancedSearchOpen);
export const selectSimpledSearchStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.IsSimpleSearchOpen : StatusBarInitialState.IsSimpleSearchOpen);
export const selectIsOpenedFromOutside = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.IsOpenedFromOutside : StatusBarInitialState.IsOpenedFromOutside);
export const selectMarkedSecondSearchSensors = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar?.markSecondSearchSensors);
export const selectGeoFilterActive = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.active);
export const selectGeoFilterType = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.type);
