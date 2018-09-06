import { createEntityAdapter } from '@ngrx/entity';
import { EntityState } from '@ngrx/entity/src/models';
import { ContextActionTypes, ContextActions } from '../actions/context.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IContext, DisplayedOverlay } from '../../models/context.model';
import { IContextEntity } from '../../models/case.model';
import { EntityAdapter } from '@ngrx/entity/src/models';

export const contextFeatureKey = 'context';

export interface IContextParams {
	defaultOverlay?: DisplayedOverlay;
	contextEntities?: IContextEntity[];
	time?: any;
}

export interface IContextState extends EntityState<IContext> {
	params: IContextParams;
}

export const contextAdapter: EntityAdapter<IContext> = createEntityAdapter<IContext>();
export const contextInitialState: IContextState = contextAdapter.getInitialState({
	params: {
		defaultOverlay: null,
		contextEntities: [],
		time: null
	}
});

export function ContextReducer(state: IContextState = contextInitialState, action: ContextActions) {
	switch (action.type) {
		case ContextActionTypes.ADD_ALL_CONTEXT:
			return contextAdapter.addAll(<IContext[]>action.payload, state);

		case ContextActionTypes.SET_CONTEXT_PARAMS:
			return { ...state, params: { ...state.params, ...action.payload } };

		default:
			return state;
	}
}

export const contextFeatureSelector: MemoizedSelector<any, IContextState>  = createFeatureSelector(contextFeatureKey);
export const selectContextsArray = createSelector(contextFeatureSelector, contextAdapter.getSelectors().selectAll);
export const selectContextsParams = createSelector(contextFeatureSelector, (context) => context && context.params);
export const selectContextEntities = createSelector(selectContextsParams, (params: IContextParams) => params && params.contextEntities);
