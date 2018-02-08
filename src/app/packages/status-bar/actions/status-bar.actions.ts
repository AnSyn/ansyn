import { Action } from '@ngrx/store';
import { CaseOrientation, CaseTimeFilter } from '@ansyn/core';
import { CaseGeoFilter } from '@ansyn/core/models/case.model';
import { ComboBoxesProperties } from '@ansyn/status-bar/models';
import { StatusBarFlag } from '@ansyn/status-bar';

export const StatusBarActionsTypes = {
	CHANGE_LAYOUT: 'CHANGE_LAYOUT',
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SELECTED_CASE_LINK: 'COPY_SELECTED_CASE_LINK',
	UPDATE_STATUS_FLAGS: 'UPDATE_STATUS_FLAGS',
	GO_PREV: 'GO_PREV',
	GO_NEXT: 'GO_NEXT',
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	EXPAND: 'EXPAND',
	SET_COMBOBOXES_PROPERTIES: 'SET_COMBOBOXES_PROPERTIES',
	SET_OVERLAYS_COUNT: 'SET_OVERLAYS_COUNT',
	SET_NOT_FROM_CASE_OVERLAY: 'SET_NOT_FROM_CASE_OVERLAY',
	SET_TIME: 'SET_TIME',
};
// some actions does not have payload
export type StatusActions = any;

export class ChangeLayoutAction implements Action {
	type: string = StatusBarActionsTypes.CHANGE_LAYOUT;

	constructor(public payload: number) {
	}
}

export class CopySelectedCaseLinkAction implements Action {
	type: string = StatusBarActionsTypes.COPY_SELECTED_CASE_LINK;

	constructor() {
	}
}

export class UpdateStatusFlagsAction implements Action {
	type = StatusBarActionsTypes.UPDATE_STATUS_FLAGS;

	constructor(public payload: { key: StatusBarFlag, value?: boolean }) {
		// code...
	}
}

export class GoPrevAction implements Action {
	type: string = StatusBarActionsTypes.GO_PREV;

	constructor() {
	}
}

export class GoNextAction implements Action {
	type: string = StatusBarActionsTypes.GO_NEXT;

	constructor() {
	}
}

export class ExpandAction implements Action {
	type: string = StatusBarActionsTypes.EXPAND;

	constructor() {
	}
}

export class BackToWorldViewAction implements Action {
	type: string = StatusBarActionsTypes.BACK_TO_WORLD_VIEW;

	constructor() {
	}
}

export class SetTimeAction implements Action {
	type: string = StatusBarActionsTypes.SET_TIME;

	constructor(public payload: { from: Date, to: Date }) {
	}
}



export class SetOverlaysCountAction implements Action {
	type = StatusBarActionsTypes.SET_OVERLAYS_COUNT;

	constructor(public payload: number) {
	}
}

export class SetOverlayNotInCaseAction implements Action {
	type = StatusBarActionsTypes.SET_NOT_FROM_CASE_OVERLAY;

	constructor(public payload: boolean) {
	}
}

export class SetComboBoxesProperties implements Action {
	type = StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES;
	constructor(public payload: ComboBoxesProperties) {
	}
}
