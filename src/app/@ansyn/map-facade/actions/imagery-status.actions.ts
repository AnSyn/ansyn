import { createAction, props } from '@ngrx/store';

export enum ImageryStatusActionTypes {
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
}

export const EnableCopyOriginalOverlayDataAction = createAction(
													ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA,
													props<{payload: boolean}>()
);
