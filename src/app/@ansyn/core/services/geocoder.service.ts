import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GeocoderService {

	constructor(protected http: HttpClient,
				protected errorHandlerService: ErrorHandlerService) {
	}

	getLocation$(searchString): Observable<any> {
		return this.http.get<any>(`http://dev.virtualearth.net/REST/v1/Locations?locality=Tel%20Aviv&maxResults=1&key=AofqJGk-uEej_Pv7hkbpXh6H3pb54luGZj6lfe90ksZEoBY-JmgTwGE2s9TF6peC`)
			.catch((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
		// return  this.http.get<any>(`${this.path}${this.resFormat}?address=${address}&language=en&key=${this.googleApiKey}`);
	}

}
