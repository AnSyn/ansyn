import { IPendingOverlay } from '@ansyn/map-facade';
import { Action, createAction, props } from '@ngrx/store';
import { type } from '../../core/utils/type';
import {
	IOverlay,
	IOverlayDrop,
	IOverlaysCriteria,
	IOverlaysCriteriaOptions,
	IOverlaysHash,
	IOverlaySpecialObject,
} from '../models/overlay.model';
import { IMarkUpData, IOverlayDropMarkUp, ITimelineRange, MarkUpClass } from '../reducers/overlays.reducer';

export const OverlaysActionTypes = {
	SELECT_OVERLAY: type('[Overlay] Select Overlay'),
	UNSELECT_OVERLAY: type('[Overlay] Unselect Overlay'),
	LOAD_OVERLAYS: type('[Overlay] Load Overlays'),
	REQUEST_OVERLAY_FROM_BACKEND: type('[Overlay] Load Overlay By Id'),
	LOAD_OVERLAYS_SUCCESS: type('[Overlay] Load Overlays Success'),
	LOAD_OVERLAYS_FAIL: type('[Overlay] Load Overlays Failed'),
	CLEAR_FILTER: type('[Overlay] Clear Filter'),
	DISPLAY_OVERLAY_FROM_STORE: type('[Overlay] Display Overlay From Store'),
	DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE: type('[Overlay] Display Multiple Overlays From Store'),
	DISPLAY_OVERLAY: type('[Overlay] Display Overlay'),
	DISPLAY_OVERLAY_SUCCESS: type('[Overlay] Display Overlay Success'),
	DISPLAY_OVERLAY_FAILED: type('[Overlay] Display Overlay Failed'),
	REDRAW_TIMELINE: type('[Overlay] Redraw Timeline'),
	ADD_OVERLAYS_MARKUPS: type('ADD_OVERLAYS_MARKUPS'),
	REMOVE_OVERLAYS_MARKUPS: type('REMOVE_OVERLAYS_MARKUPS'),
	SET_OVERLAYS_MARKUPS: type('SET_OVERLAYS_MARKUPS'),
	UPDATE_OVERLAYS_COUNT: type('UPDATE_OVERLAYS_COUNT'),
	SET_FILTERED_OVERLAYS: type('SET_FILTERED_OVERLAYS'),
	SET_TIMELINE_STATE: type('SET_TIMELINE_STATE'),
	SET_SPECIAL_OBJECTS: type('SET_SPECIAL_OBJECTS'),
	SET_DROPS: type('SET_DROPS'),
	MOUSE_OVER_DROP: type('MOUSE_OVER_DROP'),
	MOUSE_OUT_DROP: type('MOUSE_OUT_DROP'),
	SET_OVERLAYS_STATUS_MESSAGE: type('SET_OVERLAYS_STATUS_MESSAGE'),
	SET_HOVERED_OVERLAY: type('SET_HOVERED_OVERLAY'),
	CHANGE_OVERLAY_PREVIEW_ROTATION: type('[Overlay] CHANGE_OVERLAY_PREVIEW_ROTATION'),
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA',
	UPDATE_OVERLAY_COUNT: 'UPDATE_OVERLAY_COUNT',
	SET_MISC_OVERLAYS: 'SET_MISC_OVERLAYS',
	SET_MISC_OVERLAY: 'SET_MISC_OVERLAY',
};

export const SelectOverlayAction = createAction(
									OverlaysActionTypes.SELECT_OVERLAY,
									props<{payload: string}>()
);

export const SetMarkUp = createAction(
							OverlaysActionTypes.SET_OVERLAYS_MARKUPS,
							props<{ classToSet: MarkUpClass, dataToSet: IMarkUpData }>()
);

export const AddMarkUp = createAction(
							OverlaysActionTypes.ADD_OVERLAYS_MARKUPS,
							props<{payload: Array<IOverlayDropMarkUp>}>()
);

export const RemoveMarkUp = createAction(
							OverlaysActionTypes.REMOVE_OVERLAYS_MARKUPS,
							props<{ overlayIds?: Array<string>, markupToRemove?: Array<IOverlayDropMarkUp> }>()
);

export const UnSelectOverlayAction = createAction(
									OverlaysActionTypes.UNSELECT_OVERLAY,
									props<{payload: string}>()
);

export const LoadOverlaysAction = createAction(
									OverlaysActionTypes.LOAD_OVERLAYS,
									props<IOverlaysCriteria>()
);

export const RequestOverlayByIDFromBackendAction = createAction(
													OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND,
													props<{ overlayId: string, sourceType: string, mapId?: string }>()
);

export const LoadOverlaysSuccessAction = createAction(
											OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS,
											props<{payload: IOverlay[], clearExistingOverlays: boolean}>() // clearExistingOverlays = false
);

export const LoadOverlaysFailAction = createAction(
										OverlaysActionTypes.LOAD_OVERLAYS_FAIL,
										props<{payload: IOverlay[]}>()
);

export const ClearFilterAction = createAction(
									OverlaysActionTypes.CLEAR_FILTER,
									props<{payload: any}>()
);

export const DisplayOverlayFromStoreAction = createAction(
											OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE,
											props<{ id: string, mapId?: string, extent?: any, customOriantation?: string }>()
);

export const DisplayMultipleOverlaysFromStoreAction = createAction(
														OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE,
														props<{payload: IPendingOverlay[] }>()
);

export const DisplayOverlayAction = createAction(
										OverlaysActionTypes.DISPLAY_OVERLAY,
										props<{ overlay: IOverlay, mapId: string, extent?: any,
												forceFirstDisplay?: boolean, force?: boolean,
												customOriantation?: string }>()
);

export const DisplayOverlaySuccessAction = createAction(
											OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS
);

export const DisplayOverlayFailedAction = createAction(
											OverlaysActionTypes.DISPLAY_OVERLAY_FAILED,
											props<{ id: string, mapId?: string }>()
);

export const SetFilteredOverlaysAction = createAction(
											OverlaysActionTypes.SET_FILTERED_OVERLAYS,
											props<{payload: string[]}>()
											);

export const SetTimelineStateAction = createAction(
										OverlaysActionTypes.SET_TIMELINE_STATE,
										props<{ timeLineRange: ITimelineRange }>()
);

export const SetSpecialObjectsActionStore = createAction(
											OverlaysActionTypes.SET_SPECIAL_OBJECTS,
											props<{payload: IOverlaySpecialObject[]}>()
);

export const SetDropsAction = createAction(
								OverlaysActionTypes.SET_DROPS,
								props<{payload: Array<IOverlayDrop>}>()
);

export const SetOverlaysStatusMessage = createAction(
										OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE,
										props<{payload: string}>()
);

export const RedrawTimelineAction = createAction(
										OverlaysActionTypes.REDRAW_TIMELINE,
										props<{payload: string}>()
);

export const SetHoveredOverlayAction = createAction(
										OverlaysActionTypes.SET_HOVERED_OVERLAY,
										props<{payload: IOverlay}>()
);

export const ChangeOverlayPreviewRotationAction = createAction(
												OverlaysActionTypes.CHANGE_OVERLAY_PREVIEW_ROTATION,
												props<{payload: number}>()
												);

export const SetOverlaysCriteriaAction = createAction(
											OverlaysActionTypes.SET_OVERLAYS_CRITERIA,
											props<{payload: IOverlaysCriteria,
													options: IOverlaysCriteriaOptions}>() // options = null
);

export const UpdateOverlaysCountAction = createAction(
											OverlaysActionTypes.UPDATE_OVERLAY_COUNT,
											props<{payload: number}>()
);

export const SetMiscOverlays = createAction(
								OverlaysActionTypes.SET_MISC_OVERLAYS,
								props<{ miscOverlays: IOverlaysHash }>()
);

export const SetMiscOverlay = createAction(
									OverlaysActionTypes.SET_MISC_OVERLAY,
									props<{ key: string, overlay: IOverlay }>()
);
