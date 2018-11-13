import { Component, Inject, OnInit } from '@angular/core';
import { IUploadsConfig, UploadsConfig } from '../../config/uploads-config';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
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
	readonly sensorNames = [...this.config.sensorNames, 'Custom'];
	readonly sensorTypes = this.config.sensorTypes;
	readonly sharingOptions = Object.values(SharingOptions);

	sharing = SharingOptions.public;
	title = '';
	licence: boolean;
	sensorType = this.config.defaultSensorType;
	sensorName = '';
	fileInputValue: string;
	files: FileList;
	errorMessage: string;

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig,
				protected httpClient: HttpClient,
				protected store: Store<any>,
				protected errorHandlerService: ErrorHandlerService) {
	}

	uploadFile() {
		const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
		const body = new FormData();
		body.append('files', this.files.item(0));

		this.httpClient
			.post(this.config.apiUrl, body, { headers })
			.pipe(
				tap(() => this.store.dispatch(new SetToastMessageAction({ toastText: 'Success to upload file' }))),
				catchError(() => this.errorHandlerService.httpErrorHandle('Failed to upload file'))
			)
			.subscribe();
	}

	ngOnInit() {
	}
}
