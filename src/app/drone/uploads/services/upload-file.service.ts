import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { IUploadItem } from '../reducers/uploads.reducer';
import { IUploadsConfig, UploadConfig } from '../config/uploads-config';

@Injectable({
	providedIn: 'root'
})
export class UploadFileService {

	constructor(private http: HttpClient, @Inject(UploadConfig) public uploadConfig: IUploadsConfig) {
	}

	upload(uploadItem: IUploadItem) {
		const formData = this.createFormData(uploadItem);
		const req = this.createUploadRequest(formData);
		return this.http.request(req);

	}

	private createFormData({ request }: IUploadItem) {
		const formData = new FormData();
		formData.append('description', request.description);
		formData.append('creditName', request.creditName);
		formData.append('sensorType', request.sensorType);
		formData.append('sensorName', request.sensorName);
		formData.append('sharing', request.sharing);
		formData.append('file', request.file);
		formData.append('date', `${request.date}`);
		return formData;
	}

	private createUploadRequest(form: FormData): HttpRequest<any> {
		return new HttpRequest(
			'POST',
			this.uploadConfig.apiUrl,
			form,
			{
				reportProgress: true
			}
		);
	}

	cutName(name: string = '') {
		return name.length < 20 ? name : name.substring(0, 20) + '...';
	}

}


