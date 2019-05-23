import { Action } from '@ngrx/store';

export enum ImageryStatusActionTypes {
	ENABLE_COPY_ORIGINAL_OVERLAY_DATA = 'ENABLE_COPY_ORIGINAL_OVERLAY_DATA',
}

export class EnableCopyOriginalOverlayDataAction implements Action {
	type: string = ImageryStatusActionTypes.ENABLE_COPY_ORIGINAL_OVERLAY_DATA;

	constructor(public payload: boolean) {
	}
}
