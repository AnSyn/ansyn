import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

export interface IUploadsState {
	sharing: string;
}

export const uploadsFeatureKey = 'uploads';

export const initialUploadsState: IUploadsState = {
	sharing: ''
};

export const uploadsStateSelector: MemoizedSelector<any, IUploadsState> = createFeatureSelector<IUploadsState>(uploadsFeatureKey);

export function UploadsReducer(state: IUploadsState = initialUploadsState, action: any) {

	switch (action.type) {
		default:
			return state;
	}
}

export const selectSharing = createSelector(uploadsStateSelector, (state) => state.sharing);

