import { Context } from '@ansyn/core/models/context.model';

export enum ContextActionTypes {
	ADD_ALL_CONTEXT = '[Context] Add All Contexts',
}

export class AddAllContextsAction {
	readonly type = ContextActionTypes.ADD_ALL_CONTEXT;
	constructor(public payload: Context[]) {
	}
}

export type ContextActions = AddAllContextsAction;
