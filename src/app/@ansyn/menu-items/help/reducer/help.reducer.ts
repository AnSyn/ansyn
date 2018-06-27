import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { HelpActions, HelpActionTypes } from '@ansyn/menu-items/help/actions/help.actions';
import { localStorageData, updateLocalStorage } from '@ansyn/menu-items/help/services/help.local-storage.service';

export interface IHelpState {
	showHelpOnStartup: boolean;
}

export const initialHelpState: IHelpState = {
	showHelpOnStartup: localStorageData().showHelpOnStartup,
};

export const helpFeatureKey = 'help';

export const helpStateSelector: MemoizedSelector<any, IHelpState> = createFeatureSelector<IHelpState>(helpFeatureKey);

export function HelpReducer(state: IHelpState = initialHelpState, action: HelpActions) {
	switch (action.type) {

		case HelpActionTypes.SET_SHOW_HELP_ON_STARTUP:
			updateLocalStorage({ showHelpOnStartup: action.payload });
			return { ...state, showHelpOnStartup: action.payload };

	}
}

export const selectShowHelpOnStartup = createSelector(helpStateSelector, ({ showHelpOnStartup }: IHelpState) => showHelpOnStartup);
