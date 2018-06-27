import { Action } from '@ngrx/store';

export const HelpActionTypes = {
	SET_SHOW_HELP_ON_STARTUP: 'SET_SHOW_HELP_ON_STARTUP'
};


export class SetShowHelpOnStartup implements Action {
	type = HelpActionTypes.SET_SHOW_HELP_ON_STARTUP;

	constructor(public payload: boolean) {
	}
}

export type HelpActions = SetShowHelpOnStartup;
