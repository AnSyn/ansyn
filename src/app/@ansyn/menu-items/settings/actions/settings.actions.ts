import { Action } from '@ngrx/store';

export type SettingsActions = any;

export enum SettingsActionsTypes {
	SET_ANAGLYPH_STATE = '[Settings] Set Anaglyph State'
}

export class SetAnaglyphStateAction implements Action {
	readonly type = SettingsActionsTypes.SET_ANAGLYPH_STATE;

	constructor(public payload: boolean) {
	}

}
