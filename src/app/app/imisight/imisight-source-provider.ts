import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/internal/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
	BaseOverlaySourceProvider,
	GeoRegisteration,
	IFetchParams, IOverlay,
	IStartAndEndDate, Overlay,
	OverlaySourceProvider
} from '@ansyn/ansyn';
import {
	ErrorHandlerService,
	limitArray,
	LoggerService,
	sortByDateDesc
} from '@ansyn/ansyn';
import {
	bboxFromGeoJson,
	geojsonMultiPolygonToPolygon,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
} from '@ansyn/imagery';
import { IImisightOverlaySourceConfig, ImisightOverlaySourceConfig } from './imisight.model';
import { Auth0Service } from './auth0.service';
import { toRadians } from '@ansyn/map-facade';

export const ImisightOverlaySourceType = 'IMISIGHT';

const DEFAULT_OVERLAYS_LIMIT = 500;

export interface ImiSightElement {
	s3Id: string;
	geojson: object;
	timestamp: string;
	available: boolean;
	geoServerUrl: string;
	urls: object;
	geoFile: string;
	metaData: object;
	source: string;
	_id: string;
	sensorName: string;
}

@OverlaySourceProvider({
	sourceType: ImisightOverlaySourceType
})
export class ImisightSourceProvider extends BaseOverlaySourceProvider {

	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		protected auth0Service: Auth0Service,
		@Inject(ImisightOverlaySourceConfig)
		protected imisightOverlaysSourceConfig: IImisightOverlaySourceConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {

		if (this.auth0Service.auth0Active && !this.auth0Service.isValidToken()) {
			this.auth0Service.login();
			return;
		}

		const helper = new JwtHelperService();
		const token = localStorage.getItem('id_token');

		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}
		let bbox;

		if (fetchParams.region.type === 'Point') {
			bbox = bboxFromGeoJson(getPolygonByPointAndRadius((<any>fetchParams.region).coordinates).geometry as GeoJSON.Polygon);
		} else {
			bbox = bboxFromGeoJson(fetchParams.region as GeoJSON.Polygon);
		}
		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		let baseUrl = this.imisightOverlaysSourceConfig.baseUrl;
		// let headers = new HttpHeaders( );
		// add 1 to limit - so we'll know if provider have more then X overlays
		const params = {
			geoShape: fetchParams.region,
			fromDate: fetchParams.timeRange.start.toISOString(),
			toDate: fetchParams.timeRange.end.toISOString()
		};

		const httpOptions = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			}
		};
		return this.http.post<any>(baseUrl, params, httpOptions).pipe(
			map(data => this.extractData(data)),
			map((overlays: IOverlay[]) => <any> limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);


	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		let baseUrl = this.imisightOverlaysSourceConfig.baseUrl;
		return this.http.get<any>(baseUrl, { params: { _id: id } }).pipe(
			map(data => this.extractData(data.results)),
			map(([overaly]): any => overaly),
			catchError((error: any) => this.errorHandlerService.httpErrorHandle(error))
		);
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return EMPTY;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return EMPTY;
	}

	private extractData(overlays: Array<ImiSightElement>): IOverlay[] {
		if (!overlays) {
			return [];
		}
		if (!Array.isArray(overlays)) {
			overlays = [overlays];
		}
		return overlays.map((element) => this.parseData(element));
	}

	protected parseData(imiSightElement: ImiSightElement): IOverlay {
		const companyId = 1;
		const gatewayUrl = 'https://gw.sat.imisight.net';
		const footprint: any = imiSightElement.geojson;
		return new Overlay({
			id: imiSightElement._id,
			footprint: geojsonPolygonToMultiPolygon(footprint ? footprint : footprint),
			sensorType: '',
			sensorName: imiSightElement.sensorName,
			bestResolution: 1,
			name: imiSightElement.s3Id,
			imageUrl: `${gatewayUrl}/geo/geoserver/company_${companyId}/wms/${imiSightElement.geoFile}`,
			thumbnailUrl: `${gatewayUrl}/geo/geoserver/company_${companyId}/wms/${imiSightElement.geoFile}`,
			date: new Date(imiSightElement.timestamp),
			photoTime: imiSightElement.timestamp,
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: imiSightElement
		});
	}
}
