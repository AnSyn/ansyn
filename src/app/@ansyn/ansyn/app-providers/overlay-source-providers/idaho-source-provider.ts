import { Observable } from 'rxjs';
import * as wellknown from 'wellknown';
import { Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
	ErrorHandlerService,
	geojsonMultiPolygonToPolygon, GeoRegisteration,
	getPolygonByPointAndRadius,
	IOverlay,
	IOverlaysFetchData,
	limitArray,
	LoggerService,
	Overlay,
	sortByDateDesc,
	toRadians
} from '@ansyn/core';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate, OverlaySourceProvider } from '../../modules/overlays/public_api';
import { Feature, MultiPolygon, Point, Polygon } from 'geojson';
import { catchError, map } from 'rxjs/operators';

const DEFAULT_OVERLAYS_LIMIT = 500;
export const IdahoOverlaySourceType = 'IDAHO';

export const IdahoOverlaysSourceConfig = 'idahoOverlaysSourceConfig';

interface IIdahoResponse {
	idahoResult: Array<any>;
	token: string;
}

interface IIdahoResponseForGetById {
	idahoResult: any;
	token: string;
}

export interface IIdahoOverlaySourceConfig {
	baseUrl: string;
	defaultApi: string;
	overlaysByTimeAndPolygon: string;
}

@OverlaySourceProvider({
	sourceType: IdahoOverlaySourceType
})
export class IdahoSourceProvider extends BaseOverlaySourceProvider {
	constructor(public errorHandlerService: ErrorHandlerService,
				protected httpClient: HttpClient,
				@Inject(IdahoOverlaysSourceConfig) protected _overlaySourceConfig: IIdahoOverlaySourceConfig,
				protected loggerService: LoggerService) {
		super(loggerService);

	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.defaultApi) + '/' + id;
		return <Observable<IOverlay>>this.httpClient.get(url)
			.pipe(
				map(this.extractData.bind(this)),
				catchError((error: any) => {
					return this.errorHandlerService.httpErrorHandle(error);
				})
			);
	};

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		// Multiple Source Provider may send a MultiPolygon which Idaho can't handle
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as MultiPolygon);
		} else if (fetchParams.region.type === 'Point') {
			const polygonFeature: Feature<Polygon> = getPolygonByPointAndRadius((fetchParams.region as Point).coordinates);
			fetchParams.region = polygonFeature.geometry;
		}

		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.overlaysByTimeAndPolygon);

		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const requestParams = Object.assign({}, fetchParams, { limit: fetchParams.limit + 1 });
		return <Observable<IOverlaysFetchData>>this.httpClient.post(url, requestParams).pipe(
			map(this.extractArrayData.bind(this)),
			map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);

	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<IStartAndEndDate> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDate');
		return <Observable<IStartAndEndDate>>this.httpClient.post<IStartAndEndDate>(url, params)
			.pipe(catchError((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			}));
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<IStartAndEndDate> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDateRange');
		return <Observable<IStartAndEndDate>>this.httpClient.post<IStartAndEndDate>(url, params)
			.pipe(catchError((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			}));
	}

	private extractArrayData(data: IIdahoResponse): Array<IOverlay> {
		return data ? data.idahoResult.map((element) => {
			return this.parseData(element, data.token);
		}) : [];
	}

	private extractData(data: IIdahoResponseForGetById): IOverlay {
		return this.parseData(data.idahoResult, data.token);
	}

	protected parseData(idahoElement: any, token: string): IOverlay {
		const footprint: any = wellknown.parse(idahoElement.properties.footprintWkt);
		return new Overlay({
			id: idahoElement.identifier,
			footprint: footprint.geometry ? footprint.geometry : footprint,
			sensorType: idahoElement.properties.sensorName,
			sensorName: idahoElement.properties.platformName,
			channel: idahoElement.properties.numBands,
			bestResolution: idahoElement.properties.groundSampleDistanceMeters,
			name: idahoElement.properties.catalogID,
			thumbnailUrl: 'https://api.discover.digitalglobe.com/show?id=' + idahoElement.properties.catalogID + '&f=jpeg',
			date: new Date(idahoElement.properties.acquisitionDate),
			photoTime: idahoElement.properties.acquisitionDate,
			azimuth: toRadians(180 - idahoElement.properties.satAzimuth),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: idahoElement,
			baseImageUrl: 'https://idaho.geobigdata.io/v1/tile/' + idahoElement.properties.bucketName + '/' + idahoElement.identifier + '/{z}/{x}/{y}' + '?token=' + token + '&doDRA=true',
			token: token,
			catalogID: idahoElement.properties.catalogID,
			cloudCoverage: idahoElement.properties.cloudCover / 100
		});
	}
}
