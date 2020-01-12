import { Action, createAction, props } from '@ngrx/store';
import { Params } from '@angular/router';

export type RouterActions = any;

export const RouterActionTypes = {
	SET_STATE: 'SET_STATE',
	NAVIGATE_CASE: 'NAVIGATE_CASE'
};

export interface ISetStatePayload {
	caseId?: string;
	queryParams: Params;
}

export const SetStateAction = createAction(
								RouterActionTypes.SET_STATE,
								props<ISetStatePayload>()
);

export const NavigateCaseTriggerAction = createAction(
											RouterActionTypes.NAVIGATE_CASE,
											props<{payload?: string}>()
);
