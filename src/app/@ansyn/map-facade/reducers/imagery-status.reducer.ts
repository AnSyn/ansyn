import {
	ImageryStatusActionTypes
} from '../actions/imagery-status.actions';
import { uniq } from 'lodash';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { AlertMsg, AlertMsgTypes } from '../alerts/model';

export const imageryStatusFeatureKey = 'imageryStatus';
export const imageryStatusStateSelector: MemoizedSelector<any, ImageryStatusState> = createFeatureSelector<ImageryStatusState>(imageryStatusFeatureKey);

export interface ImageryStatusState {
	// @todo IOverlay

	presetOverlays: any[],
	enableCopyOriginalOverlayData: boolean;
	alertMsg: AlertMsg;
}

export const imageryStatusInitialState: ImageryStatusState = {
	presetOverlays: [],
	enableCopyOriginalOverlayData: false,
	alertMsg: new Map([
		[AlertMsgTypes.overlayIsNotPartOfQuery, new Set()],
		[AlertMsgTypes.OverlaysOutOfBounds, new Set()]
	])
};

export function ImageryStatusReducer(state: ImageryStatusState = imageryStatusInitialState, action: any): ImageryStatusState {
	switch (action.type) {

		case  ImageryStatusActionTypes.ADD_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(state.alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.add(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...state, alertMsg };
		}

		case  ImageryStatusActionTypes.REMOVE_ALERT_MSG: {
			const alertKey = action.payload.key;
			const mapId = action.payload.value;
			const alertMsg = new Map(state.alertMsg);
			const updatedSet = new Set(alertMsg.get(alertKey));
			updatedSet.delete(mapId);
			alertMsg.set(alertKey, updatedSet);
			return { ...state, alertMsg };
		}

		case ImageryStatusActionTypes.TOGGLE_OVERLAY_PRESET: {
			const { overlay, id, value } = action.payload;
			const po = [...state.presetOverlays];
			return { ...state, presetOverlays: value ? uniq([...po, overlay]) : po.filter((o) => o.id !== id) };
		}

		case ImageryStatusActionTypes.SET_PRESET_OVERLAYS:
			return { ...state, presetOverlays: action.payload };

		case ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA:
			return { ...state, enableCopyOriginalOverlayData: action.payload };

		default:
			return state;
	}
}


export const selectPresetOverlays: MemoizedSelector<any, any[]> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.presetOverlays);
export const selectEnableCopyOriginalOverlayDataFlag: MemoizedSelector<any, any> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.enableCopyOriginalOverlayData);
export const selectAlertMsg = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.alertMsg);
