import { Action } from '@ngrx/store';
import { Params } from '@angular/router';

export type RouterActions = any;

export const RouterActionTypes = {
	SET_STATE: 'SET_STATE',
	NAVIGATE_CASE: 'NAVIGATE_CASE'
};

export class SetStateAction implements Action {
	type = RouterActionTypes.SET_STATE;
	constructor(public payload: {caseId?: string, queryParams: Params}) {}
}
export class NavigateCaseTriggerAction implements Action {
	type = RouterActionTypes.NAVIGATE_CASE;
	constructor(public payload?: string) {}
}
