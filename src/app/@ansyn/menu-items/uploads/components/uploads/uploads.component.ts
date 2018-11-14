import { Component, Inject, OnInit } from '@angular/core';
import { IUploadsConfig, UploadsConfig } from '../../config/uploads-config';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ErrorHandlerService, SetToastMessageAction } from '@ansyn/core';

export interface IUploadFileRequestBody {
	files: File[]
}

export enum SharingOptions {
	public = 'Public',
	private = 'Private'
}

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
export class UploadsComponent implements OnInit {
	readonly sensorNames = [...this.config.sensorNames];
	readonly sensorTypes = this.config.sensorTypes;
	readonly sharingOptions = Object.values(SharingOptions);
	modal = false;
	sharing = SharingOptions.public;
	title = '';
	licence: boolean;
	sensorType = this.config.defaultSensorType;
	sensorName = '';
	fileInputValue: string;
	files: FileList;
	customSensorName = '';

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig,
				protected httpClient: HttpClient,
				protected store: Store<any>,
				protected errorHandlerService: ErrorHandlerService) {
	}

	submitCustomSensorName(text: string) {
		this.sensorName = text;
		this.modal = false;
	}

	onSubmit() {
		const body = new FormData();
		body.append('title', this.title);
		body.append('sensorType', this.sensorType);
		body.append('sensorName', this.sensorName);
		body.append('sharing', this.sharing);
		Array.from(this.files).forEach((file) => body.append('uploads', file));

		this.httpClient
			.post(this.config.apiUrl, body)
			.pipe(
				tap(() => this.store.dispatch(new SetToastMessageAction({ toastText: 'Success to upload file' }))),
				catchError(() => this.errorHandlerService.httpErrorHandle('Failed to upload file'))
			)
			.subscribe();
	}

	ngOnInit() {
	}
}
