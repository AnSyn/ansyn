import { createAction, props } from '@ngrx/store';

export enum SettingsActionsTypes {
	SET_ANAGLYPH_STATE = '[Settings] Set Anaglyph State'
}

export const SetAnaglyphStateAction = createAction(
										SettingsActionsTypes.SET_ANAGLYPH_STATE,
										props<{payload: boolean}>()
);

export type SettingsActions = SetAnaglyphStateAction;
