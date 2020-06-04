import { ContextActions, ContextActionTypes } from '../actions/context.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

export const contextFeatureKey = 'context';

export interface IContextParams {
	time?: any;
}

export interface IContextState {
	params: IContextParams;
}

export const contextStateSelector: MemoizedSelector<any, IContextState> = createFeatureSelector<IContextState>(contextFeatureKey);
export const contextInitialState: IContextState = {
	params: {
		time: null
	}
};

export function ContextReducer(state: IContextState = contextInitialState, action: ContextActions) {
	if (action.type === ContextActionTypes.SET_CONTEXT_PARAMS) {
		return { ...state, params: { ...state.params, ...action.payload } };
	} else {
		return state;
	}
}

export const selectContextParams = createSelector(contextStateSelector, (state) => state && state.params);
