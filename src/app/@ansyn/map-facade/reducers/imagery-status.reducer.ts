import { ImageryStatusActionTypes } from '../actions/imagery-status.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

export const imageryStatusFeatureKey = 'imageryStatus';
export const imageryStatusStateSelector: MemoizedSelector<any, IImageryStatusState> = createFeatureSelector<IImageryStatusState>(imageryStatusFeatureKey);

export interface IImageryStatusState {
	enableCopyOriginalOverlayData: boolean;

}

export const imageryStatusInitialState: IImageryStatusState = {
	enableCopyOriginalOverlayData: false,
};

export function ImageryStatusReducer(state: IImageryStatusState = imageryStatusInitialState, action: any): IImageryStatusState {
	switch (action.type) {

		case ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA:
			return { ...state, enableCopyOriginalOverlayData: action.payload };

		default:
			return state;
	}
}

export const selectEnableCopyOriginalOverlayDataFlag: MemoizedSelector<any, any> = createSelector(imageryStatusStateSelector, (imageryStatus) => imageryStatus.enableCopyOriginalOverlayData);
