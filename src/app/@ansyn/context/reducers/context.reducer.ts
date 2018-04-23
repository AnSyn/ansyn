import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { EntityState } from '@ngrx/entity/src/models';
import { Context } from '@ansyn/core';
import { ContextActionTypes, ContextActions } from '../actions/context.actions';

export type IContextState = EntityState<Context>;
export const contextAdapter = createEntityAdapter<Context>();
export const contextInitialState: IContextState = contextAdapter.getInitialState();

export function ContextReducer(state: IContextState = contextInitialState, action: ContextActions) {
	switch (action.type) {
		case ContextActionTypes.ADD_ALL_CONTEXT:
			return contextAdapter.addAll(action.payload, state);

		default:
			return state;
	}
}
