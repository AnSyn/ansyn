import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { EntityState } from '@ngrx/entity/src/models';
import { ContextActionTypes, ContextActions } from '../actions/context.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { Context } from '@ansyn/core/models/context.model';

export const contextFeatureKey = 'context';

export enum DisplayedOverlay {
	nearest = 'nearest',
	latest = 'latest',
}

export interface ContextParams {
	defaultOverlay?: DisplayedOverlay;
	time?: any;
}

export interface IContextState extends EntityState<Context> {
	params: ContextParams;
}

export const contextAdapter = createEntityAdapter<Context>();
export const contextInitialState: IContextState = contextAdapter.getInitialState({
	params: {
		defaultOverlay: null,
		time: null
	}
});

export function ContextReducer(state: IContextState = contextInitialState, action: ContextActions) {
	switch (action.type) {
		case ContextActionTypes.ADD_ALL_CONTEXT:
			return contextAdapter.addAll(<Context[]>action.payload, state);

		case ContextActionTypes.SET_CONTEXT_PARAMS:
			return { ...state, params: { ...state.params, ...action.payload } };

		default:
			return state;
	}
}

export const contextFeatureSelector: MemoizedSelector<any, IContextState>  = createFeatureSelector(contextFeatureKey);
export const selectContextsArray = createSelector(contextFeatureSelector, contextAdapter.getSelectors().selectAll);
export const selectContextsParams = createSelector(contextFeatureSelector, (context) => context && context.params);
