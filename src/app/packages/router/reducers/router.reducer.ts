import { Params } from '@angular/router';
import { RouterActions, RouterActionTypes } from '../actions/router.actions';
import { createFeatureSelector } from '@ngrx/store';

export interface IRouterState {
	caseId: string;
	queryParams: Params;
}


export const RouterInitialState: IRouterState = {
	caseId: '',
	queryParams: {}
};
export const routerFeatureKey = 'router';
export const routerStateSelector = createFeatureSelector<IRouterState>(routerFeatureKey);

export function RouterReducer(state = RouterInitialState, action: RouterActions): IRouterState {
	switch (action.type) {
		case RouterActionTypes.SET_STATE:
			return { ...state, ...action.payload };

		default:
			return state;

	}
}

