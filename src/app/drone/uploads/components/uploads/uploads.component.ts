import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { uploadConfig } from '../../config/uploads-config';
import { delay, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ErrorHandlerService, FileInputComponent, SetToastMessageAction } from '@ansyn/core';
import { isEqual } from 'lodash';
import { RequestUploadFiles, ResetFormData, UploadFormData } from '../../actions/uploads.actions';
import { initialUploadsFromData, IUploadsFormData, selectFormData } from '../../reducers/uploads.reducer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { UploadFileService } from '../../services/upload-file.service';

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class UploadsComponent implements OnInit, OnDestroy {
	@ViewChild('inputFile') inputFile: FileInputComponent;
	loading = false;
	readonly sensorNames = uploadConfig.sensorNames;
	readonly sensorTypes = uploadConfig.sensorTypes;
	readonly rulesLink = uploadConfig.rulesLink;
	modal = false;
	formData: IUploadsFormData = {...initialUploadsFromData};
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

	constructor(protected store: Store<any>,
				public service: UploadFileService,
				protected errorHandlerService: ErrorHandlerService) {
	}

	disabledReset() {
		const {files: thisFiles, ...restThisFormData} = this.formData;
		const {files: initialFiles, ...restInitialFormData} = initialUploadsFromData;
		const emptyFiles = (!thisFiles || !thisFiles.length);
		return isEqual(restThisFormData, restInitialFormData) && emptyFiles;
	}

	uploadFormData(keyValue) {
		let valid = true;
		if (keyValue.hasOwnProperty('files')) {
			let accept = this.getAcceptFile().split(',');
			let files = Object.values(keyValue.files);
			valid = files.every((f: File) => {
				let name = f.name.toLocaleLowerCase();
				return accept.some(a => name.endsWith(a.trim()));
			})
		}
		if (!valid) {
			this.store.dispatch(new SetToastMessageAction({
				toastText: `accept only ${this.getAcceptFile()} files`,
				showWarningIcon: true
			}));
			this.fileInputValue = '';
		} else {
			this.store.dispatch(new UploadFormData(keyValue));
		}
	}

	submitCustomSensorName(text: string) {
		if (text) {
			this.uploadFormData({sensorName: text, otherSensorName: true});
		}
		this.modal = false;
	}

	onSubmit() {
		this.store.dispatch(new RequestUploadFiles());

	}

	isMobile(str: string) {
		return str.includes('Mobile');
	}

	getAcceptFile() {
		let sensorTypes = this.formData.sensorType.split(' ');
		let type = sensorTypes[sensorTypes.length - 1].replace(/[()]/g, '');
		if (type.toUpperCase().includes('GEOTIFF')) {
			return '.tif';
		} else {
			return '.jpg'
		}
	}

	resetForm() {
		this.store.dispatch(new ResetFormData());
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

}
