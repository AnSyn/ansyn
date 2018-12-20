import { Action } from '@ngrx/store';
import { IUploadsFormData } from '../reducers/uploads.reducer';

export enum UploadsActionTypes {
	uploadFormData = '[Uploads] update form data',
	resetFormData = '[Uploads] reset form data'
}

export type UploadsActions = UploadFormData | ResetFormData;

export class UploadFormData implements Action {
	readonly type = UploadsActionTypes.uploadFormData;

	constructor(public payload: Partial<IUploadsFormData>) {

	}
}

export class ResetFormData implements Action {
	readonly type = UploadsActionTypes.resetFormData;
}

