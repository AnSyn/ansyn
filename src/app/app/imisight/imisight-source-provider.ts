import { Inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
	BaseOverlaySourceProvider,
	ErrorHandlerService,
	GeoRegisteration,
	IFetchParams,
	IOverlay,
	IStartAndEndDate,
	limitArray,
	LoggerService,
	Overlay,
	OverlaySourceProvider,
	sortByDateDesc
} from '@ansyn/ansyn';
import {
	bboxFromGeoJson,
	geojsonMultiPolygonToFirstPolygon,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	toRadians,
} from '@ansyn/imagery';
import { IImisightOverlaySourceConfig, ImisightOverlaySourceConfig } from './imisight.model';
import { Auth0Service } from './auth0.service';

export const ImisightOverlaySourceType = 'IMISIGHT';

const DEFAULT_OVERLAYS_LIMIT = 500;

export interface IImiSightElement {
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

	private gatewayUrl: string;
	private searchUrl: string;
	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		protected auth0Service: Auth0Service,
		@Inject(ImisightOverlaySourceConfig)
		protected imisightOverlaysSourceConfig: IImisightOverlaySourceConfig) {
		super(loggerService);
		this.searchUrl = this.imisightOverlaysSourceConfig.baseUrl + this.imisightOverlaysSourceConfig.searchPath;
		this.gatewayUrl = this.imisightOverlaysSourceConfig.baseUrl;
	}

	fetch(fetchParams: IFetchParams): Observable<any> {

		if (this.auth0Service.auth0Active && !this.auth0Service.isValidToken()) {
			this.auth0Service.login();
			return;
		}

		const helper = new JwtHelperService();
		const token = localStorage.getItem('id_token');

		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToFirstPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}
		let bbox;

		if (fetchParams.region.type === 'Point') {
			bbox = bboxFromGeoJson(getPolygonByPointAndRadius((<any>fetchParams.region).coordinates).geometry as GeoJSON.Polygon);
		} else {
			bbox = bboxFromGeoJson(fetchParams.region as GeoJSON.Polygon);
		}
		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
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
		return this.http.post<any>(this.searchUrl, params, httpOptions).pipe(
			map(data => this.extractData(data)),
			map((overlays: IOverlay[]) => <any>limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);


	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		const token = localStorage.getItem('id_token');
		const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
		const params = new HttpParams().set('id', id);
		
		return this.http.get<any>(this.searchUrl, { headers, params }).pipe(
			map(data => this.extractData(data)),
			map(([overlay]): any => overlay),
			catchError((error: any) => this.errorHandlerService.httpErrorHandle(error))
		);
	}

	private extractData(overlays: Array<IImiSightElement>): IOverlay[] {
		if (!overlays) {
			return [];
		}
		if (!Array.isArray(overlays)) {
			overlays = [overlays];
		}
		return overlays.map((element) => this.parseData(element));
	}

	protected parseData(imiSightElement: IImiSightElement): IOverlay {
		const companyId = 1;
		const footprint: any = imiSightElement.geojson;
		return new Overlay({
			id: imiSightElement._id,
			footprint: geojsonPolygonToMultiPolygon(footprint ? footprint : footprint),
			sensorType: '',
			sensorName: imiSightElement.sensorName,
			bestResolution: 1,
			name: imiSightElement.s3Id,
			imageUrl: `${ this.gatewayUrl }/geo/geoserver/company_${ companyId }/wms/${ imiSightElement.geoFile }`,
			thumbnailUrl: `${ this.gatewayUrl }/geo/geoserver/company_${ companyId }/wms/${ imiSightElement.geoFile }`,
			date: new Date(imiSightElement.timestamp),
			photoTime: imiSightElement.timestamp,
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: imiSightElement
		});
	}
}
