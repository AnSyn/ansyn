import { ContextActions, ContextActionTypes } from '../actions/context.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { DisplayedOverlay, IContextEntity } from '@ansyn/ansyn';
import { Polygon, Point } from '@turf/helpers';

export const contextFeatureKey = 'context';

export interface IContextParams {
	defaultOverlay?: DisplayedOverlay;
	contextEntities?: IContextEntity[];
	time?: any;
	position?: Point | Polygon;
}

export interface IContextState {
	params: IContextParams;
}

export const contextStateSelector: MemoizedSelector<any, IContextState> = createFeatureSelector<IContextState>(contextFeatureKey);
export const contextInitialState: IContextState = {
	params: {
		defaultOverlay: null,
		contextEntities: [],
		time: null,
		position: undefined
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
export const selectContextEntities = createSelector(selectContextParams, (params: IContextParams) => params && params.contextEntities);
export const selectContextMapPosition = createSelector(selectContextParams, (params: IContextParams) => params && params.position);
