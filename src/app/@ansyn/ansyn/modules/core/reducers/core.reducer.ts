import {
	CoreActions,
	CoreActionTypes,
	EnableCopyOriginalOverlayDataAction,
	SetFavoriteOverlaysAction,
	SetPresetOverlaysAction,
} from '../actions/core.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IOverlay, IOverlaysCriteria, ICaseDataInputFiltersState } from '@ansyn/imagery';
import { uniq } from 'lodash';

export interface ICoreState {
	favoriteOverlays: IOverlay[];
	removedOverlaysIds: string[];
	removedOverlaysIdsCount: number;
	removedOverlaysVisibility: boolean;
	presetOverlays: IOverlay[];
	overlaysCriteria: IOverlaysCriteria;
	enableCopyOriginalOverlayData: boolean;
	autoSave: boolean;
}

export const coreInitialState: ICoreState = {
	favoriteOverlays: [],
	removedOverlaysIds: [],
	removedOverlaysIdsCount: 0,
	removedOverlaysVisibility: true,
	presetOverlays: [],
	overlaysCriteria: {},
	autoSave: false,
	enableCopyOriginalOverlayData: false
};

export const coreFeatureKey = 'core';
export const coreStateSelector: MemoizedSelector<any, ICoreState> = createFeatureSelector<ICoreState>(coreFeatureKey);

export function CoreReducer(state = coreInitialState, action: CoreActions | any): ICoreState {
	switch (action.type) {

		case CoreActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA:
			return { ...state, enableCopyOriginalOverlayData: (action as EnableCopyOriginalOverlayDataAction).payload };

		case CoreActionTypes.TOGGLE_OVERLAY_FAVORITE: {
			const { overlay, id, value } = action.payload;
			const fo = [...state.favoriteOverlays];
			return { ...state, favoriteOverlays: value ? uniq([...fo, overlay]) : fo.filter((o) => o.id !== id) };
		}

		case CoreActionTypes.TOGGLE_OVERLAY_PRESET: {
			const { overlay, id, value } = action.payload;
			const po = [...state.presetOverlays];
			return { ...state, presetOverlays: value ? uniq([...po, overlay]) : po.filter((o) => o.id !== id) };
		}

		case CoreActionTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: (action as SetFavoriteOverlaysAction).payload };

		case CoreActionTypes.SET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: action.payload };

		case CoreActionTypes.SET_REMOVED_OVERLAY_ID:
			const { id, value } = action.payload;
			const removedOverlaysIds = value ? uniq([...state.removedOverlaysIds, id]) : state.removedOverlaysIds.filter(_id => id !== _id);
			return { ...state, removedOverlaysIds };

		case CoreActionTypes.RESET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: [] };

		case CoreActionTypes.SET_REMOVED_OVERLAYS_VISIBILITY:
			return { ...state, removedOverlaysVisibility: action.payload };

		case CoreActionTypes.SET_PRESET_OVERLAYS:
			return { ...state, presetOverlays: (action as SetPresetOverlaysAction).payload };

		case  CoreActionTypes.SET_OVERLAYS_CRITERIA:
			const overlaysCriteria = { ...state.overlaysCriteria, ...action.payload };
			return { ...state, overlaysCriteria };

		case CoreActionTypes.SET_AUTO_SAVE:
			return { ...state, autoSave: action.payload };

		case CoreActionTypes.SET_REMOVED_OVERLAY_IDS_COUNT:
			return { ...state, removedOverlaysIdsCount: action.payload };

		default:
			return state;
	}
}

export const selectFavoriteOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(coreStateSelector, (core) => core.favoriteOverlays);
export const selectRemovedOverlays: MemoizedSelector<any, string[]> = createSelector(coreStateSelector, (core) => core.removedOverlaysIds);
export const selectRemovedOverlaysVisibility: MemoizedSelector<any, boolean> = createSelector(coreStateSelector, (core) => core.removedOverlaysVisibility);
export const selectPresetOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(coreStateSelector, (core) => core.presetOverlays);
export const selectOverlaysCriteria: MemoizedSelector<any, IOverlaysCriteria> = createSelector(coreStateSelector, (core) => core.overlaysCriteria);
export const selectDataInputFilter: MemoizedSelector<any, ICaseDataInputFiltersState> = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria.dataInputFilters);
export const selectRegion: MemoizedSelector<any, any> = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria && overlayCriteria.region);
export const selectTime: MemoizedSelector<any, any> = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria && overlayCriteria.time);
export const selectEnableCopyOriginalOverlayDataFlag: MemoizedSelector<any, any> = createSelector(coreStateSelector, (core) => core.enableCopyOriginalOverlayData);
export const selectAutoSave: MemoizedSelector<any, boolean> = createSelector(coreStateSelector, (core) => core.autoSave);
export const selectRemovedOverlaysIdsCount: MemoizedSelector<any, number> = createSelector(coreStateSelector, (core) => core.removedOverlaysIdsCount);

/* @todo: remove contexts actions */
export const contextFeatureSelector: any = createFeatureSelector('contexts');
export const selectContextsParams = createSelector(contextFeatureSelector, (context: any) => context && context.params);
export const selectContextEntities = createSelector(selectContextsParams, (params: any) => params && params.contextEntities);
export const selectContextsArray = createSelector(contextFeatureSelector, ({ entities }) => Object.values(entities));
