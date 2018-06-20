import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { Observable } from 'rxjs/Observable';
import { Point } from 'geojson';
import { ICoreConfig, IMapSearchConfig } from '@ansyn/core/models/core.config.model';
import { CoreConfig } from '@ansyn/core/models/core.config';

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
			.filter(Boolean)
			.map(res => res.point)
			.map((point: Point) => ({...point, coordinates: point.coordinates.reverse()}))
			.catch((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

}
