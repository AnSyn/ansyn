import { Action } from '@ngrx/store';

export const StatusBarActionsTypes = {
	CHANGE_LAYOUT: 'CHANGE_LAYOUT',
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SELECTED_CASE_LINK: 'COPY_SELECTED_CASE_LINK',
	SET_LINK_COPY_TOAST_VALUE: 'SET_LINK_COPY_TOAST_VALUE',
	UPDATE_STATUS_FLAGS: "UPDATE_STATUS_FLAGS",
	OPEN_SHARE_LINK: 'OPEN_SHARE_LINK'
};

export type StatusActions = ChangeLayoutAction |  UpdateStatusFlagsAction;

export class ChangeLayoutAction implements Action {
	type: string = StatusBarActionsTypes.CHANGE_LAYOUT;
	constructor(public payload: number) {}
}

export class CopySelectedCaseLinkAction implements Action{
	type: string = StatusBarActionsTypes.COPY_SELECTED_CASE_LINK;
	constructor() {}
}

export class SetLinkCopyToastValueAction implements Action{
	type: string = StatusBarActionsTypes.SET_LINK_COPY_TOAST_VALUE;
	constructor(public payload: boolean) {}
}


export class UpdateStatusFlagsAction implements Action {
	type = StatusBarActionsTypes.UPDATE_STATUS_FLAGS;
	constructor(public payload: any) {
		// code...
	}
}
export class OpenShareLink implements Action{
	type: string = StatusBarActionsTypes.OPEN_SHARE_LINK;
	constructor() {}
}

