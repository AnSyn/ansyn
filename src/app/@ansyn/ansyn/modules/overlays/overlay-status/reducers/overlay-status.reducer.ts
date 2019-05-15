import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq } from 'lodash';
import { IOverlay } from '../../models/overlay.model'
import { OverlayStatusActions, OverlayStatusActionsTypes } from '../actions/overlay-status.actions';

export const overlayStatusFeatureKey = 'overlayStatus';
export const overlayStatusStateSelector: MemoizedSelector<any, IOverlayStatusState> = createFeatureSelector<IOverlayStatusState>(overlayStatusFeatureKey);

export interface IOverlayStatusState {
	favoriteOverlays: IOverlay[]
}

export const overlayStatusInitialState: IOverlayStatusState = {
	favoriteOverlays: []
};

export function OverlayStatusReducer(state: IOverlayStatusState = overlayStatusInitialState, action: OverlayStatusActions | any): IOverlayStatusState {
	switch (action.type) {
		case OverlayStatusActionsTypes.SET_FAVORITE_OVERLAYS:
			return {...state, favoriteOverlays: action.payload};

		case OverlayStatusActionsTypes.TOGGLE_OVERLAY_FAVORITE: {
			const {overlay, id, value} = action.payload;
			const fo = [...state.favoriteOverlays];
			return {...state, favoriteOverlays: value ? uniq([...fo, overlay]) : fo.filter((o) => o.id !== id)};
		}
		default:
			return state;
	}
}

export const selectFavoriteOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus ? overlayStatus.favoriteOverlays : []);
