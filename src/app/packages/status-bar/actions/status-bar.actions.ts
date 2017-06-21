import { Action } from '@ngrx/store';

export const StatusBarActionsTypes = {
	CHANGE_LAYOUT: 'CHANGE_LAYOUT',
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	SHARE_SELECTED_CASE_LINK: 'SHARE_SELECTED_CASE_LINK',
	SET_LINK_COPY_TOAST_VALUE: 'SET_LINK_COPY_TOAST_VALUE'
};

export type StatusActions = ChangeLayoutAction;

export class ChangeLayoutAction implements Action{
	type: string = StatusBarActionsTypes.CHANGE_LAYOUT;
	constructor(public payload: number) {}
}

export class ShareSelectedCaseLinkAction implements Action{
	type: string = StatusBarActionsTypes.SHARE_SELECTED_CASE_LINK;
	constructor() {}
}

export class SetLinkCopyToastValueAction implements Action{
	type: string = StatusBarActionsTypes.SET_LINK_COPY_TOAST_VALUE;
	constructor(public payload: boolean) {}
}

