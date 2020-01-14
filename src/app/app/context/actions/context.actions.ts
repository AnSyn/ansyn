import { createAction, props } from '@ngrx/store';
import { IContext } from '@ansyn/ansyn';
import { IContextParams } from '../reducers/context.reducer';

export enum ContextActionTypes {
	ADD_ALL_CONTEXT = '[Context] Add All Contexts',
	SET_CONTEXT_PARAMS = '[Context] Set context params'
}

export const AddAllContextsAction = createAction(
										ContextActionTypes.ADD_ALL_CONTEXT,
										props<{payload: IContext[]}>()
);

export const SetContextParamsAction = createAction(
										ContextActionTypes.SET_CONTEXT_PARAMS,
										props<{payload: Partial<IContextParams>}>()
);
