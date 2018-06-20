import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { Observable } from 'rxjs/Observable';
import { Point } from 'geojson';

@Injectable()
export class GeocoderService {

	constructor(protected http: HttpClient,
				protected errorHandlerService: ErrorHandlerService) {
	}

	getLocation$(searchString): Observable<any> {
		return this.http.get<any>(`http://dev.virtualearth.net/REST/v1/Locations?locality=San%20Francisco&maxResults=1&key=AofqJGk-uEej_Pv7hkbpXh6H3pb54luGZj6lfe90ksZEoBY-JmgTwGE2s9TF6peC`)
			.map(res => res.resourceSets[0].resources[0].point)
			.map((point: Point) => ({...point, coordinates: point.coordinates.reverse()}))
			.catch((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
		// return  this.http.get<any>(`${this.path}${this.resFormat}?address=${address}&language=en&key=${this.googleApiKey}`);
	}

}
