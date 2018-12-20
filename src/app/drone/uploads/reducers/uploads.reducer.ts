import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { ResetFormData, UploadFormData, UploadsActions, UploadsActionTypes } from '../actions/uploads.actions';

export interface IUploadsFormData {
	description: string;
	sharing: string;
	creditName: string;
	licence: boolean;
	sensorType: string;
	sensorName: string,
	otherSensorName: boolean
	files: FileList;
}

export interface IUploadsState {
	formData: IUploadsFormData;
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
	formData: initialUploadsFromData
};

export const uploadsStateSelector: MemoizedSelector<any, IUploadsState> = createFeatureSelector<IUploadsState>(uploadsFeatureKey);

export function UploadsReducer(state: IUploadsState = initialUploadsState, action: UploadsActions) {
	switch (action.type) {
		case UploadsActionTypes.uploadFormData:
			const formData = { ...state.formData, ...action.payload };
			return { ...state, formData };

		case UploadsActionTypes.resetFormData:
			return { ...state, formData: { ...initialUploadsFromData } };

		default:
			return state;
	}
}

export const selectFormData = createSelector(uploadsStateSelector, (state) => state.formData);
