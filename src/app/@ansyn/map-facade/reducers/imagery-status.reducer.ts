import { ImageryStatusActionTypes } from '../actions/imagery-status.actions';
import { uniq } from 'lodash';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IOverlay } from '@ansyn/imagery';

export const imageryStatusFeatureKey = 'imageryStatus';
export const imageryStatusStateSelector: MemoizedSelector<any, ImageryStatusState> = createFeatureSelector<ImageryStatusState>(imageryStatusFeatureKey);

export interface ImageryStatusState {
	favoriteOverlays: any[],
	removedOverlaysIds: any[],
	presetOverlays: any[],
	removedOverlaysVisibility: boolean,
	removedOverlaysIdsCount: number;
	enableCopyOriginalOverlayData: boolean
}

const imageryStatusInitial: ImageryStatusState = {
	favoriteOverlays: [],
	removedOverlaysIds: [],
	presetOverlays: [],
	removedOverlaysVisibility: true,
	removedOverlaysIdsCount: 0,
	enableCopyOriginalOverlayData: false
};

export const ImageryStatusReducer = (state: ImageryStatusState = imageryStatusInitial, action: any): ImageryStatusState => {
	switch (action.type) {

		case ImageryStatusActionTypes.TOGGLE_OVERLAY_FAVORITE: {
			const { overlay, id, value } = action.payload;
			const fo = [...state.favoriteOverlays];
			return { ...state, favoriteOverlays: value ? uniq([...fo, overlay]) : fo.filter((o) => o.id !== id) };
		}

		case ImageryStatusActionTypes.TOGGLE_OVERLAY_PRESET: {
			const { overlay, id, value } = action.payload;
			const po = [...state.presetOverlays];
			return { ...state, presetOverlays: value ? uniq([...po, overlay]) : po.filter((o) => o.id !== id) };
		}

		case ImageryStatusActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: action.payload };

		case ImageryStatusActionTypes.SET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: action.payload };

		case ImageryStatusActionTypes.SET_REMOVED_OVERLAY_ID:
			const { id, value } = action.payload;
			const removedOverlaysIds = value ? uniq([...state.removedOverlaysIds, id]) : state.removedOverlaysIds.filter(_id => id !== _id);
			return { ...state, removedOverlaysIds };

		case ImageryStatusActionTypes.RESET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: [] };

		case ImageryStatusActionTypes.SET_REMOVED_OVERLAYS_VISIBILITY:
			return { ...state, removedOverlaysVisibility: action.payload };

		case ImageryStatusActionTypes.SET_REMOVED_OVERLAY_IDS_COUNT:
			return { ...state, removedOverlaysIdsCount: action.payload };

		case ImageryStatusActionTypes.SET_PRESET_OVERLAYS:
			return { ...state, presetOverlays: action.payload };

		case ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA:
			return { ...state, enableCopyOriginalOverlayData: action.payload };


	}
};

export const selectRemovedOverlaysVisibility: MemoizedSelector<any, boolean> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.removedOverlaysVisibility);
export const selectRemovedOverlaysIdsCount: MemoizedSelector<any, number> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.removedOverlaysIdsCount);
export const selectFavoriteOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.favoriteOverlays);
export const selectPresetOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.presetOverlays);
export const selectRemovedOverlays: MemoizedSelector<any, string[]> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.removedOverlaysIds);
export const selectEnableCopyOriginalOverlayDataFlag: MemoizedSelector<any, any> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.enableCopyOriginalOverlayData);
