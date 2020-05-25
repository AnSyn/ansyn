import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { uniq } from 'lodash';
import { AlertMsg } from '../../../alerts/model';
import { IOverlay } from '../../models/overlay.model'
import { OverlayStatusActions, OverlayStatusActionsTypes } from '../actions/overlay-status.actions';
import {
	ImageManualProcessArgs,
	IOverlaysManualProcessArgs,
	ITranslationData
} from '../../../menu-items/cases/models/case.model';
import { MultiPolygon } from 'geojson';

export const overlayStatusFeatureKey = 'overlayStatus';
export const overlayStatusStateSelector: MemoizedSelector<any, IOverlayStatusState> = createFeatureSelector<IOverlayStatusState>(overlayStatusFeatureKey);

export enum overlayStatusFlags {
	autoImageProcessing = 'autoImageProcessing',
	imageProcessingDisabled = 'imageProcessingDisabled',
}

export interface ITranslationsData {
	[key: string]: ITranslationData;
}
export interface IScannedArea {
	id: string;
	area: MultiPolygon;
}

export interface IOverlayStatusState {
	favoriteOverlays: IOverlay[];
	removedOverlaysIds: string[];
	removedOverlaysVisibility: boolean;
	removedOverlaysIdsCount: number;
	presetOverlays: IOverlay[];
	flags: Map<overlayStatusFlags, boolean>;
	alertMsg: AlertMsg;
	manualImageProcessingParams: ImageManualProcessArgs;
	overlaysTranslationData: ITranslationsData,
	overlaysScannedAreaData: {
		[key: string]: MultiPolygon;
	}
}

export interface IImageProcessState {
	manualImageProcessingParams: ImageManualProcessArgs;
	overlaysManualProcessArgs: IOverlaysManualProcessArgs;
}

export const overlayStatusInitialState: IOverlayStatusState = {
	flags: new Map<overlayStatusFlags, boolean>(),
	favoriteOverlays: [],
	presetOverlays: [],
	removedOverlaysIds: [],
	removedOverlaysVisibility: true,
	removedOverlaysIdsCount: 0,
	alertMsg: new Map([]),
	overlaysTranslationData: {},
	overlaysScannedAreaData: {},
	manualImageProcessingParams: {}
};

export function OverlayStatusReducer(state: IOverlayStatusState = overlayStatusInitialState, action: OverlayStatusActions | any): IOverlayStatusState {
	let tmpMap: Map<overlayStatusFlags, boolean>;

	switch (action.type) {
		case OverlayStatusActionsTypes.SET_FAVORITE_OVERLAYS:
			return { ...state, favoriteOverlays: action.payload };

		case OverlayStatusActionsTypes.TOGGLE_OVERLAY_FAVORITE: {
			const { overlay, id, value } = action.payload;
			const fo = [...state.favoriteOverlays];
			return { ...state, favoriteOverlays: value ? uniq([...fo, overlay]) : fo.filter((o) => o.id !== id) };
		}

		case OverlayStatusActionsTypes.TOGGLE_OVERLAY_PRESET: {
			const { overlay, id, value } = action.payload;
			const po = [...state.presetOverlays];
			return { ...state, presetOverlays: value ? uniq([...po, overlay]) : po.filter((o) => o.id !== id) };
		}

		case OverlayStatusActionsTypes.SET_PRESET_OVERLAYS:
			return { ...state, presetOverlays: action.payload };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: action.payload };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_ID:
			const { id, value } = action.payload;
			const removedOverlaysIds = value ? uniq([...state.removedOverlaysIds, id]) : state.removedOverlaysIds.filter(_id => id !== _id);
			return { ...state, removedOverlaysIds };

		case OverlayStatusActionsTypes.ENABLE_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set(overlayStatusFlags.imageProcessingDisabled, false);
			tmpMap.set(overlayStatusFlags.autoImageProcessing, false);
			return { ...state, flags: tmpMap };

		case OverlayStatusActionsTypes.DISABLE_IMAGE_PROCESSING:
			tmpMap = new Map(state.flags);
			tmpMap.set(overlayStatusFlags.imageProcessingDisabled, true);
			tmpMap.set(overlayStatusFlags.autoImageProcessing, false);
			return { ...state, flags: tmpMap };

		case OverlayStatusActionsTypes.RESET_REMOVED_OVERLAY_IDS:
			return { ...state, removedOverlaysIds: [] };

		case OverlayStatusActionsTypes.SET_MANUAL_IMAGE_PROCESSING:
			return { ...state, manualImageProcessingParams: action.payload };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAYS_VISIBILITY:
			return { ...state, removedOverlaysVisibility: action.payload };

		case OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_IDS_COUNT:
			return { ...state, removedOverlaysIdsCount: action.payload };

		case OverlayStatusActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS:
			tmpMap = new Map(state.flags);
			tmpMap.set(overlayStatusFlags.autoImageProcessing, action.payload);
			return { ...state, flags: tmpMap };

		case OverlayStatusActionsTypes.ADD_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(state.alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.add(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...state, alertMsg };
		}

		case OverlayStatusActionsTypes.REMOVE_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(state.alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.delete(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...state, alertMsg };
		}

		case OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE: {
			const { overlayId, dragged } = action.payload;
			return {
				...state, overlaysTranslationData: {
					...state.overlaysTranslationData, [overlayId]: {
						...state.overlaysTranslationData[overlayId],
						dragged
					}
				}
			};
		}

		case OverlayStatusActionsTypes.SET_OVERLAY_TRANSLATION_DATA: {
			const { overlayId, offset } = action.payload;
			return {
				...state, overlaysTranslationData: {
					...state.overlaysTranslationData, [overlayId]: {
						...state.overlaysTranslationData[overlayId],
						offset
					}
				}
			};
		}

		case OverlayStatusActionsTypes.SET_OVERLAYS_TRANSLATION_DATA: {
			return { ...state, overlaysTranslationData: action.payload };
		}

		case OverlayStatusActionsTypes.SET_OVERLAY_SCANNED_AREA_DATA: {
			const { id, area } = action.payload;
			return {
				...state, overlaysScannedAreaData: {
					...state.overlaysScannedAreaData,
					[id]: area
				}
			};
		}

		case OverlayStatusActionsTypes.SET_OVERLAYS_SCANNED_AREA_DATA: {
			return { ...state, overlaysScannedAreaData: action.payload };
		}

		default:
			return state;
	}
}

export const selectFavoriteOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus ? overlayStatus.favoriteOverlays : []);
export const selectRemovedOverlaysVisibility: MemoizedSelector<any, boolean> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.removedOverlaysVisibility);
export const selectRemovedOverlaysIdsCount: MemoizedSelector<any, number> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.removedOverlaysIdsCount);
export const selectRemovedOverlays: MemoizedSelector<any, string[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.removedOverlaysIds);
export const selectPresetOverlays: MemoizedSelector<any, IOverlay[]> = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.presetOverlays);
export const selectAlertMsg = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus.alertMsg);
export const selectTranslationData = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus && overlayStatus.overlaysTranslationData);
export const selectScannedAreaData = createSelector(overlayStatusStateSelector, (overlayStatus) => overlayStatus && overlayStatus.overlaysScannedAreaData);
