import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs/index';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/internal/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate } from '@ansyn/overlays';
import {
	bboxFromGeoJson,
	ErrorHandlerService,
	geojsonMultiPolygonToPolygon, geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius, IOverlay, limitArray,
	LoggerService, sortByDateDesc, toRadians
} from '@ansyn/core';
import { IImisightOverlaySourceConfig, ImisightOverlaySourceConfig } from '../imisight.model';
import { IOverlaysPlanetFetchData } from '../../overlay-source-providers/planet/planet.model';

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

@Injectable()
export class ImisightSourceProvider extends BaseOverlaySourceProvider {

	sourceType = ImisightOverlaySourceType;


	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(ImisightOverlaySourceConfig)
		protected imisightOverlaysSourceConfig: IImisightOverlaySourceConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {

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
			map((overlays: IOverlay[]) => <IOverlaysPlanetFetchData> limitArray(overlays, fetchParams.limit, {
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
		let overlay: IOverlay = <IOverlay> {};
		const footprint: any = imiSightElement.geojson;
		overlay.id = imiSightElement._id;
		overlay.footprint = geojsonPolygonToMultiPolygon(footprint ? footprint : footprint);
		overlay.sensorType = '';
		overlay.sensorName = imiSightElement.sensorName;
		overlay.bestResolution = 1;
		overlay.name = imiSightElement.s3Id;
		overlay.imageUrl = `${gatewayUrl}/geo/geoserver/company_${companyId}/wms/${imiSightElement.geoFile}`;
		overlay.thumbnailUrl = `${gatewayUrl}/geo/geoserver/company_${companyId}/wms/${imiSightElement.geoFile}`;
		overlay.date = new Date(imiSightElement.timestamp);
		overlay.photoTime = imiSightElement.timestamp;
		overlay.azimuth = toRadians(180);
		overlay.sourceType = this.sourceType;
		overlay.isGeoRegistered = true;
		overlay.tag = imiSightElement;
		return overlay;
	}
}
