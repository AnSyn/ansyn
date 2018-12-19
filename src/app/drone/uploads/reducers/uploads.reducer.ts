import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { UpdateState, UploadsActionTypes } from '../actions/uploads.actions';

export interface IUploadsState {
	description: string;
	sharing: string;
}

export const uploadsFeatureKey = 'uploads';

export const initialUploadsState: IUploadsState = {
	description: '',
	sharing: ''
};

export const uploadsStateSelector: MemoizedSelector<any, IUploadsState> = createFeatureSelector<IUploadsState>(uploadsFeatureKey);

export function UploadsReducer(state: IUploadsState = initialUploadsState, action: UpdateState) {
	switch (action.type) {
		case UploadsActionTypes.updateState:
			return { ...state, ...action.payload };

		default:
			return state;
	}
}

export const selectSharing = createSelector(uploadsStateSelector, (state) => state.sharing);
export const selectDescription = createSelector(uploadsStateSelector, (state) => state.description);
