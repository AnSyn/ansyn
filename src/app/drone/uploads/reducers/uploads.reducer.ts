import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { UploadsActions, UploadsActionTypes } from '../actions/uploads.actions';

export interface IBaseUploadForm {
	description: string;
	sharing: string;
	creditName: string;
	licence: boolean;
	sensorType: string;
	sensorName: string,
	otherSensorName: boolean
}

export interface IUploadsFormData extends IBaseUploadForm {
	files: FileList;
}

export interface IUploadRequest extends IBaseUploadForm {
	file: File;

}

export interface IUploadItem {
	request: IUploadRequest;
	percent: number;
	response: any;
	index: number;
}

export interface IUploadsState {
	formData: IUploadsFormData;
	uploadList: IUploadItem[];
}

export const uploadsFeatureKey = 'uploads';

export const initialUploadsFromData: IUploadsFormData = {
	description: '',
	sharing: '',
	creditName: '',
	licence: false,
	sensorType: '',
	sensorName: '',
	otherSensorName: false,
	files: null
};

export const initialUploadsState: IUploadsState = {
	formData: initialUploadsFromData,
	uploadList: []
};

export const uploadsStateSelector: MemoizedSelector<any, IUploadsState> = createFeatureSelector<IUploadsState>(uploadsFeatureKey);

export function UploadsReducer(state: IUploadsState = initialUploadsState, action: UploadsActions) {
	switch (action.type) {
		case UploadsActionTypes.uploadFormData:
			const formData = { ...state.formData, ...action.payload };
			return { ...state, formData };
		case UploadsActionTypes.addRequestToFileList: {
			const uploadList = [...state.uploadList, ...action.payload];
			return { ...state, uploadList };
		}
		case UploadsActionTypes.updateUploadFilePercent: {
			const { index, percent } = action.payload;
			const uploadList = [...state.uploadList];
			uploadList[index].percent = percent;
			return { ...state, uploadList };
		}
		case UploadsActionTypes.requestUploadFileSuccess: {
			const { index, body } = action.payload;
			const uploadList = [...state.uploadList];
			uploadList[index].percent = 100;
			uploadList[index].response = { ...body };
			return { ...state, uploadList };
		}
		case UploadsActionTypes.clearUploadList:
			const list = [...state.uploadList];
			const uploadList = list.filter(file => file.response === undefined);
			return { ...state, uploadList };
		case UploadsActionTypes.resetFormData:
			return { ...state, formData: { ...initialUploadsFromData } };

		default:
			return state;
	}
}

export const selectFormData = createSelector(uploadsStateSelector, (state) => state.formData);
export const selectUploadList = createSelector(uploadsStateSelector, (state) => state.uploadList);
