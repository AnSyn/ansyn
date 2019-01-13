import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { IUploadsConfig, UploadsConfig } from '../config/uploads-config';
import { IUploadItem } from '../reducers/uploads.reducer';

@Injectable({
	providedIn: 'root'
})
export class UploadFileService {

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig,
				private http: HttpClient) {
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
		formData.append('uploads', request.file);
		return formData;
	}

	private createUploadRequest(form: FormData): HttpRequest<any> {
		return new HttpRequest(
			'POST',
			this.config.apiUrl,
			form,
			{
				reportProgress: true
			}
		);
	}

}


