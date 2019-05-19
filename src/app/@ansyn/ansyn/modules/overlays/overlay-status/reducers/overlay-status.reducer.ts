import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq } from 'lodash';
import { IOverlay } from '../../models/overlay.model'
import { OverlayStatusActions, OverlayStatusActionsTypes } from '../actions/overlay-status.actions';

export const overlayStatusFeatureKey = 'overlayStatus';
export const overlayStatusStateSelector: MemoizedSelector<any, IOverlayStatusState> = createFeatureSelector<IOverlayStatusState>(overlayStatusFeatureKey);

export interface IOverlayStatusState {
	favoriteOverlays: IOverlay[],
	presetOverlays: IOverlay[],
}

export const overlayStatusInitialState: IOverlayStatusState = {
	favoriteOverlays: [],
	presetOverlays: [],
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

		case OverlayStatusActionsTypes.TOGGLE_OVERLAY_PRESET: {
			const { overlay, id, value } = action.payload;
			const po = [...state.presetOverlays];
			return { ...state, presetOverlays: value ? uniq([...po, overlay]) : po.filter((o) => o.id !== id) };
		}

		case OverlayStatusActionsTypes.SET_PRESET_OVERLAYS:
			return { ...state, presetOverlays: action.payload };

		default:
			return state;
	}
}

export const selectFavoriteOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(overlayStatusStateSelector, (overlayStatus) =>  overlayStatus.favoriteOverlays);
export const selectPresetOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.presetOverlays);
