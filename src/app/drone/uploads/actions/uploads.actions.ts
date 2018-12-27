import { Action } from '@ngrx/store';
import { IUploadItem, IUploadsFormData } from '../reducers/uploads.reducer';
import { IOverlay } from '@ansyn/core';

export enum UploadsActionTypes {
	addRequestToFileList = '[Uploads] add request to file list',
	updateUploadFilePercent = '[Uploads] update upload file percent',
	uploadFormData = '[Uploads] update form data',
	requestUploadFiles = '[Uploads] request upload files',
	requestUploadFileSuccess = '[Uploads] request upload file success',
	resetFormData = '[Uploads] reset form data',
	clearUploadList = '[Uploads] clear upload list',
	moveToUploadOverlay = '[Uploads] move to upload overlay'
}

export type UploadsActions =
	UploadFormData
	| ResetFormData
	| RequestUploadFiles
	| RequestUploadFileSuccess
	| UpdateUploadFilePercent
	| ClearUploadList
	| AddRequestToFileList
	| MoveToUploadOverlay;

export class UploadFormData implements Action {
	readonly type = UploadsActionTypes.uploadFormData;

	constructor(public payload: Partial<IUploadsFormData>) {

	}
}

export class RequestUploadFiles implements Action {
	readonly type = UploadsActionTypes.requestUploadFiles;
}

export class UpdateUploadFilePercent implements Action {
	readonly type = UploadsActionTypes.updateUploadFilePercent;

	constructor(public payload: { index: number, percent: number }) {
	}
}

export class RequestUploadFileSuccess implements Action {
	readonly type = UploadsActionTypes.requestUploadFileSuccess;

	constructor(public payload: { index: number, body: any }) {
	}
}

export class MoveToUploadOverlay implements Action {
	readonly type = UploadsActionTypes.moveToUploadOverlay;

	constructor(public payload: { overlay: IOverlay, mapId: string }) {
	}
}

export class AddRequestToFileList implements Action {
	readonly type = UploadsActionTypes.addRequestToFileList;

	constructor(public payload: IUploadItem[]) {
	}
}

export class ClearUploadList implements Action {
	readonly type = UploadsActionTypes.clearUploadList;
}

export class ResetFormData implements Action {
	readonly type = UploadsActionTypes.resetFormData;
}

