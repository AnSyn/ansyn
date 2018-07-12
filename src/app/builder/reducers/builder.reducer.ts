import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { BuilderActionTypes } from '@builder/actions/builder.actions';

export interface IWindowLayout {
	menu: boolean,
	statusBar: boolean,
	timeLine: boolean,
	contextSun: boolean,
	toolsOverMenu: boolean
}

export interface IBuilderState {
	windowLayout: IWindowLayout;
}

export const builderInitialState: IBuilderState = {
	windowLayout: {
		menu: true,
		statusBar: true,
		timeLine: true,
		contextSun: true,
		toolsOverMenu: false
	}
};
export const builderFeatureKey = 'builder';
export const builderStateSelector: MemoizedSelector<any, IBuilderState> = createFeatureSelector<IBuilderState>(builderFeatureKey);

export const BuilderReducer = (state = builderInitialState, action: any): IBuilderState => {
	switch (action.type) {
		case BuilderActionTypes.SET_WINDOW_LAYOUT: {
			return { ...state, windowLayout: action.payload };
		}
		default:
			return state;
	}
};

export const selectWindowLayout = createSelector(builderStateSelector, (builder) => builder.windowLayout)
