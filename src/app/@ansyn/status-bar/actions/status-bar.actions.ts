import { Action } from '@ngrx/store';
import { ComboBoxesProperties } from '@ansyn/status-bar/models';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar';

export const StatusBarActionsTypes = {
	UPDATE_SEARCH_MODE: 'UPDATE_SEARCH_MODE',
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SELECTED_CASE_LINK: 'COPY_SELECTED_CASE_LINK',
	UPDATE_STATUS_FLAGS: 'UPDATE_STATUS_FLAGS',
	GO_PREV: 'GO_PREV',
	GO_ADJACENT_OVERLAY: 'GO_ADJACENT_OVERLAY',
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	EXPAND: 'EXPAND',
	SET_COMBOBOXES_PROPERTIES: 'SET_COMBOBOXES_PROPERTIES'
};
// some actions does not have payload
export type StatusActions = any;

export class UpdateSearchModeAction implements Action {
	type: string = StatusBarActionsTypes.UPDATE_SEARCH_MODE;

	constructor(public payload: string) {
	}
}

export class CopySelectedCaseLinkAction implements Action {
	type: string = StatusBarActionsTypes.COPY_SELECTED_CASE_LINK;

	constructor() {
	}
}

export class UpdateStatusFlagsAction implements Action {
	type = StatusBarActionsTypes.UPDATE_STATUS_FLAGS;

	constructor(public payload: { key: statusBarFlagsItemsEnum, value?: boolean }) {
	}
}


export class ExpandAction implements Action {
	type: string = StatusBarActionsTypes.EXPAND;

	constructor() {
	}
}


export class SetComboBoxesProperties implements Action {
	type = StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES;

	constructor(public payload: ComboBoxesProperties) {
	}
}
