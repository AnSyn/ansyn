import { createEntityAdapter } from '@ngrx/entity';
import { EntityState } from '@ngrx/entity/src/models';
import { Context } from '@ansyn/core';
import { ContextActionTypes, ContextActions } from '@ansyn/context/actions/context.actions';
import { createSelector } from '@ngrx/store';
import { contextFeatureSelector } from './index';

export interface IContextState extends EntityState<Context> {
	contextsLoaded: boolean;
}

export const contextAdapter = createEntityAdapter();
export const contextInitialState: IContextState = contextAdapter.getInitialState({
	contextsLoaded: false
});

export function ContextReducer(state: IContextState = contextInitialState, action: ContextActions) {
	switch (action.type) {
		case ContextActionTypes.ADD_ALL_CONTEXT:
			return contextAdapter.addAll(action.payload, { ...state, contextsLoaded: true } );

		default:
			return state;
	}
}
