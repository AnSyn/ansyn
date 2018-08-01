import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IStartAndEndDate
} from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { empty, Observable } from 'rxjs/index';
import { limitArray } from '@ansyn/core/utils/i-limited-array';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { bboxFromGeoJson, geojsonMultiPolygonToPolygon, getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

export const ImisightOverlaySourceType = 'IMISIGHT';

const DEFAULT_OVERLAYS_LIMIT = 500;

export const ImisightOverlaySourceConfig: InjectionToken<IImisightOverlaySourceConfig> = new InjectionToken('imisight-overlays-source-config');

export interface IImisightOverlaySourceConfig {
	baseUrl: string;
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
		const token = localStorage.getItem('access_token');
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
		return this.http.post<any>(baseUrl, { params: params }, httpOptions)

			.map(data => {
				return this.extractArrayData(data.results);
			})
			.map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
			.catch((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		let baseUrl = this.imisightOverlaysSourceConfig.baseUrl;
		return this.http.get<any>(baseUrl, { params: { _id: id } })
			.map(data => {
				return this.extractData(data.results);
			})
			.catch((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return empty();
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return empty();
	}

	private extractArrayData(overlays: Array<any>): Array<IOverlay> {
		if (!overlays) {
			return [];
		}

		return overlays.filter(meta => meta.properties && meta.properties.tms && !meta.properties.tms.includes('mapbox'))
			.map((element) => this.parseData(element));
	}

	private extractData(overlays: Array<any>): IOverlay {
		if (overlays.length > 0) {
			return this.parseData(overlays[0]);
		}
	}

	protected parseData(openAerialElement: any): IOverlay {
		let overlay: IOverlay = <IOverlay> {};


		return overlay;
	}
}
