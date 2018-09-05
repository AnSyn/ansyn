import { IContext } from '@ansyn/core/models/context.model';
import { IContextParams } from 'src/app/@ansyn/core/context/reducers/context.reducer';

export enum ContextActionTypes {
	ADD_ALL_CONTEXT = '[Context] Add All Contexts',
	SET_CONTEXT_PARAMS = '[Context] Set context params'
}

export class AddAllContextsAction {
	readonly type = ContextActionTypes.ADD_ALL_CONTEXT;
	constructor(public payload: IContext[]) {
	}
}

export class SetContextParamsAction {
	readonly type = ContextActionTypes.SET_CONTEXT_PARAMS;
	constructor(public payload: Partial<IContextParams>) {
	}
}

export type ContextActions = AddAllContextsAction | SetContextParamsAction;
