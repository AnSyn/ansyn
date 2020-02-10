import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IMapFacadeConfig, IMapSearchConfig } from '../models/map-config.model';
import { mapFacadeConfig } from '../models/map-facade.config';
import { catchError, map } from 'rxjs/operators';
import { SetToastMessageAction } from '../actions/map.actions';
import { Point } from 'geojson';

@Injectable()
export class GeocoderService {

	public config: IMapSearchConfig = null;

	constructor(protected http: HttpClient,
				@Inject(mapFacadeConfig) public packageConfig: IMapFacadeConfig) {
		this.config = this.packageConfig.mapSearch;
	}

	getLocation$(searchString): Observable<{ name: string, point: Point }[]> {
		const url = this.config.url.replace('$searchString', searchString).replace('$apiKey', this.config.apiKey);
		return this.http.get<any>(url).pipe(
			map(res => res.resourceSets[0]),
			map((resources: any[]) => resources ?
				resources.map(resource =>
					({
						name: resource.name,
						point: { ...resource.point, coordinates: resource.point.coordinates.reverse() }
					})) : []),
			catchError((error: Response | any) => {
				console.warn(error);
				return of([{ name: 'No results', point: undefined }]);
			})
		);
	}
}
