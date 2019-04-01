import {
	CoreActions,
	CoreActionTypes,
	EnableCopyOriginalOverlayDataAction,
} from '../actions/core.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IOverlay, IOverlaysCriteria, ICaseDataInputFiltersState } from '@ansyn/imagery';
import { uniq } from 'lodash';

export interface ICoreState {

	removedOverlaysIdsCount: number;
	removedOverlaysVisibility: boolean;
	overlaysCriteria: IOverlaysCriteria;
	enableCopyOriginalOverlayData: boolean;
	autoSave: boolean;
}

export const coreInitialState: ICoreState = {
	removedOverlaysIdsCount: 0,
	removedOverlaysVisibility: true,
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

		case  CoreActionTypes.SET_OVERLAYS_CRITERIA:
			const overlaysCriteria = { ...state.overlaysCriteria, ...action.payload };
			return { ...state, overlaysCriteria };

		case CoreActionTypes.SET_AUTO_SAVE:
			return { ...state, autoSave: action.payload };

		default:
			return state;
	}
}


export const selectRemovedOverlaysVisibility: MemoizedSelector<any, boolean> = createSelector(coreStateSelector, (core) => core.removedOverlaysVisibility);
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
