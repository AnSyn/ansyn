import { IContextParams } from '../reducers/context.reducer';

export enum ContextActionTypes {
	SET_CONTEXT_PARAMS = '[Context] Set context params',
}


export class SetContextParamsAction {
	readonly type = ContextActionTypes.SET_CONTEXT_PARAMS;

	constructor(public payload: Partial<IContextParams>) {
	}
}

export type ContextActions = SetContextParamsAction ;
