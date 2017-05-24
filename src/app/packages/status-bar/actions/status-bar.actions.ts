import { Action } from '@ngrx/store';

export const StatusBarActionsTypes = {
	CHANGE_LAYOUT: 'CHANGE_LAYOUT'
};

export type StatusActions = ChangeLayoutAction;

export class ChangeLayoutAction implements Action{
	type: string = StatusBarActionsTypes.CHANGE_LAYOUT;
	constructor(public payload: number) {}
}
