import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { EntityState } from '@ngrx/entity/src/models';
import { ContextActionTypes, ContextActions } from '../actions/context.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { Context } from '@ansyn/core/models/context.model';

export const contextFeatureKey = 'context';
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

export const contextFeatureSelector: MemoizedSelector<any, IContextState>  = createFeatureSelector(contextFeatureKey);
export const selectContextsArray = createSelector(contextFeatureSelector, contextAdapter.getSelectors().selectAll);
