import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { Observable } from 'rxjs/Observable';
import { ICoreConfig, IMapSearchConfig } from '@ansyn/core/models/core.config.model';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { of } from 'rxjs/observable/of';

@Injectable()
export class GeocoderService {

	public config: IMapSearchConfig = null;

	constructor(protected http: HttpClient,
				protected errorHandlerService: ErrorHandlerService,
				@Inject(CoreConfig) public packageConfig: ICoreConfig) {
		this.config = this.packageConfig.mapSearch;
	}

	getLocation$(searchString): Observable<any> {
		const url = this.config.url.replace('$searchString', searchString).replace('$apiKey', this.config.apiKey);
		return this.http.get<any>(url)
			.map(res => res.resourceSets[0].resources[0])
			.map(res => res ? {...res.point, coordinates: res.point.coordinates.reverse()} : null)
			.catch((error: Response | any) => {
				this.errorHandlerService.httpErrorHandle(error);
				console.warn(error);
				return of(null);
			});
	}

}
