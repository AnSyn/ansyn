import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq } from 'lodash';
import { IOverlay } from '../../models/overlay.model'
import { OverlayStatusActions, OverlayStatusActionsTypes } from '../actions/overlay-status.actions';

export const overlayStatusFeatureKey = 'overlayStatus';
export const overlayStatusStateSelector: MemoizedSelector<any, IOverlayStatusState> = createFeatureSelector<IOverlayStatusState>(overlayStatusFeatureKey);

export interface IOverlayStatusState {
	favoriteOverlays: IOverlay[];
	removedOverlaysIds: string[];
	removedOverlaysVisibility: boolean;
	removedOverlaysIdsCount: number;
}

export const overlayStatusInitialState: IOverlayStatusState = {
	favoriteOverlays: [],
	removedOverlaysIds: [],
	removedOverlaysVisibility: true,
	removedOverlaysIdsCount: 0,
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

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: action.payload };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_ID:
			const { id, value } = action.payload;
			const removedOverlaysIds = value ? uniq([...state.removedOverlaysIds, id]) : state.removedOverlaysIds.filter(_id => id !== _id);
			return { ...state, removedOverlaysIds };

		case OverlayStatusActionsTypes.RESET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: [] };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAYS_VISIBILITY:
			return { ...state, removedOverlaysVisibility: action.payload };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS_COUNT:
			return { ...state, removedOverlaysIdsCount: action.payload };
		default:
			return state;
	}
}

export const selectFavoriteOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus ? overlayStatus.favoriteOverlays : []);
export const selectRemovedOverlaysVisibility: MemoizedSelector<any, boolean> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.removedOverlaysVisibility);
export const selectRemovedOverlaysIdsCount: MemoizedSelector<any, number> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.removedOverlaysIdsCount);
export const selectRemovedOverlays: MemoizedSelector<any, string[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.removedOverlaysIds);
