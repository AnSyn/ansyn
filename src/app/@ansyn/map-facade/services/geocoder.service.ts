import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, EMPTY } from 'rxjs';
import { IMapFacadeConfig, IMapSearchConfig } from '../models/map-config.model';
import { mapFacadeConfig } from '../models/map-facade.config';
import { catchError, map } from 'rxjs/operators';
import { Point } from 'geojson';
import { ProjectionConverterService } from './projection-converter.service';
import { point } from '@turf/helpers';

@Injectable()
export class GeocoderService {
	coordinateRegex = {
		basic: /([0-9]{1,3}[.[0-9]+]?)[, ]([0-9]{1,3}[.[0-9]+]?)( ([0-9]{1,2}))?/
	};
	placeholder = 'Search';
	public config: IMapSearchConfig = null;

	constructor(protected http: HttpClient,
				@Inject(mapFacadeConfig) public packageConfig: IMapFacadeConfig) {
		this.config = this.packageConfig.mapSearch;
	}

	getLocation$(searchString: string): Observable<{ name: string, point: Point }[]> {
		const url = this.config.url.concat(searchString).concat("&format=geojson");
		if (/\d/.test(searchString.charAt(0))) { // user enter coordinates
			return of([]);
		}
		return this.http.get<any>(url).pipe(
			map( (locations: any) => locations.features.map( feature => ({ name: feature.properties.display_name, point: feature.geometry }))),
			catchError((error: Response | any) => {
				console.warn(error);
				return of([{ name: undefined, point: undefined }]);
			})
		);
	}

	isCoordinates(value: string): boolean {
		return Object.values(this.coordinateRegex).some(reg => reg.test(value));
	}


	createPoint(value): Point {
		const coordinate = this.coordinateRegex.basic.exec(value);
		const [_, lat, lon] = coordinate;
		const coords = [+lon, +lat];
		if ( ProjectionConverterService.isValidGeoWGS84(coords)) {
			return point(coords).geometry;
		}

	}
}
