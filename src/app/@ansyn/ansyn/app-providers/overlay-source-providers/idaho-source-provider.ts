import { Observable } from 'rxjs';
import * as wellknown from 'wellknown';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geojsonMultiPolygonToPolygon, getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import {
	BaseOverlaySourceProvider, IFetchParams,
	IStartAndEndDate
} from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { toRadians } from '@ansyn/core/utils/math';
import { IOverlay, IOverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { limitArray } from '@ansyn/core/utils/i-limited-array';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';
import { Feature, MultiPolygon, Point, Polygon } from 'geojson';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { LoggerService } from '@ansyn/core/services/logger.service';

const DEFAULT_OVERLAYS_LIMIT = 500;
export const IdahoOverlaySourceType = 'IDAHO';

export const IdahoOverlaysSourceConfig: InjectionToken<IIdahoOverlaySourceConfig> = new InjectionToken('idaho-overlays-source-config');

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

@Injectable()
export class IdahoSourceProvider extends BaseOverlaySourceProvider {
	sourceType = IdahoOverlaySourceType;

	constructor(public errorHandlerService: ErrorHandlerService,
				protected httpClient: HttpClient,
				@Inject(IdahoOverlaysSourceConfig) protected _overlaySourceConfig: IIdahoOverlaySourceConfig,
				protected loggerService: LoggerService) {
		super(loggerService);

	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.defaultApi) + '/' + id;
		return <Observable<IOverlay>>this.httpClient.get(url)
			.map(this.extractData.bind(this))
			.catch((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
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
		return <Observable<IOverlaysFetchData>>this.httpClient.post(url, requestParams)
			.map(this.extractArrayData.bind(this))
			.map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
			.catch((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});

	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<IStartAndEndDate> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDate');
		return <Observable<IStartAndEndDate>>this.httpClient.post<IStartAndEndDate>(url, params)
			.catch((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<IStartAndEndDate> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDateRange');
		return <Observable<IStartAndEndDate>>this.httpClient.post<IStartAndEndDate>(url, params)
			.catch((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
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
		let overlay: IOverlay = <IOverlay> {};
		const footprint: any = wellknown.parse(idahoElement.properties.footprintWkt);
		overlay.id = idahoElement.identifier;
		overlay.footprint = footprint.geometry ? footprint.geometry : footprint;
		let bands = '0';
		if (idahoElement.properties.numBands > 1 && idahoElement.properties.numBands < 5) {
			bands = '2,1,0';
		} else if (idahoElement.properties.numBands >= 5) {
			bands = '4,2,1';
		}
		overlay.sensorType = idahoElement.properties.sensorName;
		overlay.sensorName = idahoElement.properties.platformName;
		overlay.channel = idahoElement.properties.numBands;
		overlay.bestResolution = idahoElement.properties.groundSampleDistanceMeters;
		overlay.name = idahoElement.properties.catalogID;

		// https://gbdxdocs.digitalglobe.com/v1/docs/get-a-tms-tile
		// https://idaho.geobigdata.io/v1/tile/:bucket_name/:idaho_id/:tileZ/:tileX/:TileY
		overlay.imageUrl = 'https://idaho.geobigdata.io/v1/tile/' + idahoElement.properties.bucketName + '/' + idahoElement.identifier + '/{z}/{x}/{y}?bands=' + bands + '&token=' + token;
		overlay.thumbnailUrl = 'https://api.discover.digitalglobe.com/show?id=' + idahoElement.properties.catalogID + '&f=jpeg';
		overlay.date = new Date(idahoElement.properties.acquisitionDate);
		overlay.photoTime = idahoElement.properties.acquisitionDate;
		overlay.azimuth = toRadians(180 - idahoElement.properties.satAzimuth);
		overlay.sourceType = this.sourceType;
		overlay.isGeoRegistered = true;
		overlay.tag = idahoElement;
		(<any>overlay).catalogID = idahoElement.properties.catalogID;

		return overlay;
	}
}
