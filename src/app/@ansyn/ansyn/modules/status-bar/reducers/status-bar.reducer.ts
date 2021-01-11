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
}

export const StatusBarInitialState: IStatusBarState = {
	geoFilterStatus: {
		type: CaseGeoFilter.PinPoint,
		active: false
	},
	isCalenderOpen: false
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

		default:
			return state;

	}
}

export const selectGeoFilterStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.geoFilterStatus : StatusBarInitialState.geoFilterStatus);
export const selectCalenderStatus = createSelector(statusBarStateSelector, (statusBar: IStatusBarState) => statusBar ? statusBar.isCalenderOpen : StatusBarInitialState.isCalenderOpen);
export const selectGeoFilterActive = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.active);
export const selectGeoFilterType = createSelector(selectGeoFilterStatus, (geoFilterStatus: IGeoFilterStatus) => geoFilterStatus.type);
