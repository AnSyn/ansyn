import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs/index';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/internal/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate } from '@ansyn/overlays';
import {
	bboxFromGeoJson,
	ErrorHandlerService,
	geojsonMultiPolygonToPolygon,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	IOverlay,
	limitArray,
	LoggerService,
	Overlay,
	sortByDateDesc,
	toRadians
} from '@ansyn/core';
import { ITBOverlaySourceConfig, TBOverlaySourceConfig, TBOverlay } from './tb.model';
import { IOverlaysPlanetFetchData } from '../planet/planet.model';

export const TBOverlaySourceType = 'IMISIGHT';

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
export class TBSourceProvider extends BaseOverlaySourceProvider {

	sourceType = TBOverlaySourceType;


	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(TBOverlaySourceConfig)
		protected tbOverlaysSourceConfig: ITBOverlaySourceConfig) {
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
		let baseUrl = this.tbOverlaysSourceConfig.baseUrl;
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
		let baseUrl = this.tbOverlaysSourceConfig.baseUrl;
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

	private extractData(overlays: Array<TBOverlay>): IOverlay[] {
		if (!overlays) {
			return [];
		}
		if (!Array.isArray(overlays)) {
			overlays = [overlays];
		}
		return overlays.map((element) => this.parseData(element));
	}

	protected parseData(tbOverlay: TBOverlay): IOverlay {
		const companyId = 1;
		// const footprint: any = tbOverlay.geojson;
		return new Overlay({
			id: tbOverlay.worldName + tbOverlay.fileName, // for now, api not clear 
			// footprint: geojsonPolygonToMultiPolygon(footprint ? footprint : footprint),
			sensorType: '',
			sensorName: tbOverlay.sensorName,
			bestResolution: 1,
			name: tbOverlay.fileName,
			imageUrl: tbOverlay.folderPath,
			date: new Date(tbOverlay.layerUpload),
			photoTime: tbOverlay.fileCreated,
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: true,
			tag: tbOverlay
		});
	}
}
