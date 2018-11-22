import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { SettingsActions, SettingsActionsTypes } from '../actions/settings.actions';

export enum settingsFlags {
	isAnaglyphActive = 'isAnaglyphActive'
}

export interface ISettingsState {
	flags: Map<settingsFlags, boolean>;
}

export const settingsInitialState = {
	flags: new Map<settingsFlags, boolean>([
		[settingsFlags.isAnaglyphActive, false]
	])
};

export const settingsFeatureKey = 'settings';
export const settingsStateSelector: MemoizedSelector<any, ISettingsState> = createFeatureSelector<ISettingsState>(settingsFeatureKey);

export function SettingsReducer(state = settingsInitialState, action: SettingsActions) {
	switch (action.type) {
		case SettingsActionsTypes.SET_ANAGLYPH_STATE:
			const tmpMap = new Map(state.flags);
			tmpMap.set(settingsFlags.isAnaglyphActive, action.payload);
			return { ...state, flags: tmpMap };
		default:
			return state;
	}
}

export const selectFlags = createSelector(settingsStateSelector, (state) => state.flags);
export const selectIsAnaglyphActive = createSelector(selectFlags, (flags) => flags.get(settingsFlags.isAnaglyphActive));
