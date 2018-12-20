import { Component, Inject, ViewChild } from '@angular/core';
import { IUploadsConfig, UploadsConfig } from '../../config/uploads-config';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ErrorHandlerService, SetToastMessageAction } from '@ansyn/core';
import { isEqual } from 'lodash';
import { ResetFormData, UploadFormData } from '../../actions/uploads.actions';
import { initialUploadsFromData, IUploadsFormData, selectFormData } from '../../reducers/uploads.reducer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { FileInputComponent } from '@ansyn/core';

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class UploadsComponent {
	@ViewChild('inputFile') inputFile: FileInputComponent;
	loading = false;
	readonly sensorNames = this.config.sensorNames;
	readonly sensorTypes = this.config.sensorTypes;
	readonly rulesLink = this.config.rulesLink;
	modal = false;
	formData: IUploadsFormData = { ...initialUploadsFromData };
	fileInputValue: string;

	@AutoSubscription
	uploadsState$ = this.store.select(selectFormData).pipe(
		delay(0),
		tap((formData: IUploadsFormData) => {
			this.formData = formData;
			if (formData.files && formData.files.length) {
				this.inputFile.input.nativeElement.files = formData.files;
			} else {
				this.fileInputValue = '';
			}
		})
	);

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig,
				protected httpClient: HttpClient,
				protected store: Store<any>,
				protected errorHandlerService: ErrorHandlerService) {
	}

	disabledReset() {
		const {files: thisFiles, ...restThisFormData } = this.formData;
		const {files: initialFiles, ...restInitialFormData } = initialUploadsFromData;
		const emptyFiles = (!thisFiles || !thisFiles.length);
		return isEqual(restThisFormData , restInitialFormData) && emptyFiles;
	}

	uploadFormData(keyValue) {
		this.store.dispatch(new UploadFormData(keyValue));
	}

	submitCustomSensorName(text: string) {
		if (text) {
			console.log(text);
			this.uploadFormData({ sensorName: text, otherSensorName: true })
		}
		this.modal = false;
	}

	onSubmit() {

		this.loading = true;
		const formData = new FormData();
		formData.append('description', this.formData.description);
		formData.append('creditName', this.formData.creditName);
		formData.append('sensorType', this.formData.sensorType);
		formData.append('sensorName', this.formData.sensorName);
		formData.append('sharing', this.formData.sharing);
		Array.from(this.formData.files).forEach((file) => formData.append('uploads', file));

		this.httpClient
			.post(this.config.apiUrl, formData)
			.pipe(
				tap(() => this.store.dispatch(new SetToastMessageAction({ toastText: 'Success to upload file' }))),
				catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to upload file', null)),
				tap(() => {
					this.loading = false;
					this.resetForm();
				})
			)
			.subscribe();
	}

	resetForm() {
		this.store.dispatch(new ResetFormData());
	}

}
