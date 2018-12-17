import { Component, Inject } from '@angular/core';
import { IUploadsConfig, UploadsConfig } from '../../config/uploads-config';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ErrorHandlerService, SetToastMessageAction } from '@ansyn/core';
import { isEqual } from 'lodash';

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
export class UploadsComponent {
	loading = false;
	readonly sensorNames = this.config.sensorNames;
	readonly sensorTypes = this.config.sensorTypes;
	readonly rulesLink = this.config.rulesLink;
	modal = false;

	sharing: string;
	description: string;
	licence: boolean;
	sensorType: string;
	sensorName: string;
	fileInputValue: string;
	files: FileList;
	other: boolean;
	creditName: string;

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig,
				protected httpClient: HttpClient,
				protected store: Store<any>,
				protected errorHandlerService: ErrorHandlerService) {
		this.resetForm();
	}

	disabledReset() {
		const { sharing, description, licence, sensorType, sensorName, fileInputValue, creditName, other } = this;
		return isEqual({
			sharing: this.config.defaultSharing,
			description: '',
			licence: false,
			sensorType: this.config.defaultSensorType,
			sensorName: '',
			fileInputValue: '',
			creditName: '',
			other: false
		}, { sharing, description, licence, sensorType, sensorName, fileInputValue, creditName, other });
	}

	submitCustomSensorName(text: string) {
		if (text) {
			this.other = true;
			this.sensorName = text;
		}
		this.modal = false;
	}

	onSubmit() {
		this.resetForm();
		this.loading = true;
		const formData = new FormData();
		formData.append('description', this.description);
		formData.append('creditName', this.creditName);
		formData.append('sensorType', this.sensorType);
		formData.append('sensorName', this.sensorName);
		formData.append('sharing', this.sharing);
		Array.from(this.files).forEach((file) => formData.append('uploads', file));

		this.httpClient
			.post(this.config.apiUrl, formData)
			.pipe(
				tap(() => this.store.dispatch(new SetToastMessageAction({ toastText: 'Success to upload file' }))),
				catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to upload file', null)),
				tap(() => {
					this.loading = false;
				})
			)
			.subscribe();
	}

	resetForm() {
		this.sharing = this.config.defaultSharing;
		this.description = '';
		this.licence = false;
		this.sensorType = this.config.defaultSensorType;
		this.sensorName = '';
		this.fileInputValue = '';
		this.other = false;
	}

}
