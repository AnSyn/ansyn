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
		basic: /([0-9]{1,3}[.[0-9]+]?)[, ]([0-9]{1,3}[.[0-9]+]?)( ([0-9]{1,2}))?/,
		wgs84GeoRegex: /^(?:[\s\t]*)(?:wgs84)?(?:[\s\t]*)(?:geo)?(?:\s*)([\-+]?\d{1,3}(?:\.\d+)?)(?:[\s\t]*)(?:e)?(?:[\s\t]*)[/\s,\\](?:[\s\t]*)([\-+]?\d{1,3}(?:\.\d+)?)(?:[\s\t]*)(?:n)?(?:[\s\t]*)$/i,
		wgs84UtmRegex: /^(?:[\s\t]*)(?:wgs84)(?:[\s\t]*)(?:utm)(?:\s*)(?:(\d+)\s*[nNsS])?(?:[\s\t]*)([\-+]?\d{2,}\.?\d*)(?:[\s\t]*)(?:e)?(?:[\s\t]*)[\s,\\](?:[\s\t]*)([\-+]?\d{2,}\.?\d*)(?:[\s\t]*)(?:n)(?:[\s\t]*)$/i,
		ed50UtmRegex: /^(?:[\s\t]*)(?:ed50)(?:[\s\t]*)(?:utm)?(?:\s*)(?:(\d+)\s*[nNsS])?(?:[\s\t]*)([\-+]?\d{2,})(?:[\s\t]*)(?:e)?(?:e)?(?:[\s\t]*)[/\s,\\](?:[\s\t]*)([\-+]?\d{2,})(?:[\s\t]*)(?:n)?(?:[\s\t]*)?/i,
		noPrefixUtmRegex: /^(?:[\s\t]*)([\-+]?\d{2,}(?:.\d+)?)(?:[\s\t]*)(?:e)?(?:[\s\t]*)[/\s,//](?:[\s\t]*)([\-+]?\d{2,}(?:.\d+)?)(?:[\s\t]*)$/i
	};
	placeholder = 'Search';
	public config: IMapSearchConfig = null;

	constructor(protected http: HttpClient,
				@Inject(mapFacadeConfig) public packageConfig: IMapFacadeConfig,
				protected projectionConverterService: ProjectionConverterService) {
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

	createPoint(value: string): Point {
		let searchResult: any;

		// BASIC (UTM)
		searchResult = this.coordinateRegex.basic.exec(value);
		if (searchResult && searchResult.length) {
			const [matchedString, x, y, zone] = searchResult;
			const coords = [+x, +y, +zone];
			if (ProjectionConverterService.isValidUTM(coords)) {
				const convertPoint = this.projectionConverterService.convertByProjectionDatum(
					coords,
					{ datum: 'wgs84', projection: 'utm'},
					{ datum: 'ed50', projection: 'geo'}
				);
				return point(convertPoint).geometry;
			}
		}

		// WGS84 GEO
		searchResult = this.coordinateRegex.wgs84GeoRegex.exec(value);
		if (searchResult && searchResult.length) {
			const [matchedString, lat, lon] = searchResult;
			const coords = [+lon, +lat];
			if (ProjectionConverterService.isValidGeoWGS84(coords)) {
				return point(coords).geometry;
			}
		}

		// WGS84 UTM
		searchResult = this.coordinateRegex.wgs84UtmRegex.exec(value);
		if (searchResult && searchResult.length) {
			const [matchedString, zone, x, y] = searchResult;
			const coords = [+x, +y, +zone];
			if (ProjectionConverterService.isValidUTM(coords)) {
				const convertPoint = this.projectionConverterService.convertByProjectionDatum(
					coords,
					{ datum: 'wgs84', projection: 'utm'},
					{ datum: 'wgs84', projection: 'geo'}
				);
				return point(convertPoint).geometry;
			}
		}

		// NO PREFIX UTM
		searchResult = this.coordinateRegex.noPrefixUtmRegex.exec(value);
		if (searchResult && searchResult.length) {
			const DEFAULT_UTM_ZONE = 36;
			const [matchedString, x, y] = searchResult;
			const coords = [+x, +y, DEFAULT_UTM_ZONE];
			if (ProjectionConverterService.isValidUTM(coords)) {
				const convertPoint = this.projectionConverterService.convertByProjectionDatum(
					coords,
					{ datum: 'wgs84', projection: 'utm'},
					{ datum: 'wgs84', projection: 'geo'}
				);
				return point(convertPoint).geometry;
			}
		}
	}

}
