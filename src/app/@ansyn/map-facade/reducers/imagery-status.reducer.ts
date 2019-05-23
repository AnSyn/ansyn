import {
	ImageryStatusActionTypes
} from '../actions/imagery-status.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

export const imageryStatusFeatureKey = 'imageryStatus';
export const imageryStatusStateSelector: MemoizedSelector<any, ImageryStatusState> = createFeatureSelector<ImageryStatusState>(imageryStatusFeatureKey);

// TODO: move to ansyn
enum AlertMsgTypes {
	OverlaysOutOfBounds = 'overlaysOutOfBounds',
	overlayIsNotPartOfQuery = 'overlayIsNotPartOfQuery'
}

export interface ImageryStatusState {
	// @todo AlertMsg
	enableCopyOriginalOverlayData: boolean;
	alertMsg: Map<AlertMsgTypes, Set<string>>;
}

export const imageryStatusInitialState: ImageryStatusState = {
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

		case ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA:
			return { ...state, enableCopyOriginalOverlayData: action.payload };

		default:
			return state;
	}
}

export const selectEnableCopyOriginalOverlayDataFlag: MemoizedSelector<any, any> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.enableCopyOriginalOverlayData);
export const selectAlertMsg = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.alertMsg);
