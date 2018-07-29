import { Observable, throwError } from 'rxjs';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IStartAndEndDate
} from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';
import { geojsonMultiPolygonToPolygon, geojsonPolygonToMultiPolygon } from '@ansyn/core/utils/geo';
import { limitArray } from '@ansyn/core/utils/i-limited-array';
import { toRadians } from '@ansyn/core/utils/math';
import { HttpResponseBase } from '@angular/common/http/src/response';
import { IOverlaysPlanetFetchData, PlanetOverlay } from './planet.model';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import * as moment from 'moment';
import { IDataInputFilterValue } from '@ansyn/core/models/case.model';
import { forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

const DEFAULT_OVERLAYS_LIMIT = 249;
export const PlanetOverlaySourceType = 'PLANET';

export const PlanetOverlaysSourceConfig: InjectionToken<IPlanetOverlaySourceConfig> = new InjectionToken('planet-overlays-source-config');

export interface IPlanetOverlaySourceConfig {
	baseUrl: string;
	itemTypes: string[];
	apiKey: string;
	tilesUrl: string;
}

export interface IPlanetFilter {
	type: string,
	field_name?: string,
	config: object;
}

@Injectable()
export class PlanetSourceProvider extends BaseOverlaySourceProvider {
	sourceType = PlanetOverlaySourceType;
	private httpHeaders: HttpHeaders;

	protected planetDic = {
		'sensorType': 'item_type',
		'sensorName': 'satellite_id',
		'photoTime': 'acquired',
		'bestResolution': 'gsd'
	};

	constructor(public errorHandlerService: ErrorHandlerService,
				protected http: HttpClient,
				@Inject(PlanetOverlaysSourceConfig)
				protected planetOverlaysSourceConfig: IPlanetOverlaySourceConfig,
				protected loggerService: LoggerService) {
		super(loggerService);

		this.httpHeaders = new HttpHeaders({
			Authorization:
				`basic ${btoa((this.planetOverlaysSourceConfig.apiKey + ':'))}`
		});
	}

	buildFilters(config: IPlanetFilter[], sensors?: string[]) {
		return {
			item_types: Array.isArray(sensors) ? sensors : this.planetOverlaysSourceConfig.itemTypes,
			filter: {
				type: 'AndFilter',
				config: config
			}
		};
	}

	appendApiKey(url: string) {
		return `${url}?api_key=${this.planetOverlaysSourceConfig.apiKey}`;
	}

	fetch(fetchParams: IFetchParams): Observable<IOverlaysPlanetFetchData> {
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}
		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		let baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const limit = `${fetchParams.limit + 1}`;

		const bboxFilter = { type: 'GeometryFilter', field_name: 'geometry', config: fetchParams.region };
		const dateFilter = {
			type: 'DateRangeFilter', field_name: 'acquired',
			config: { gte: fetchParams.timeRange.start.toISOString(), lte: fetchParams.timeRange.end.toISOString() }
		};

		const filters: IPlanetFilter[] = [bboxFilter, dateFilter];

		if (Array.isArray(fetchParams.dataInputFilters) && fetchParams.dataInputFilters.length > 0) {
			const configFilters = [];
			const preFilter = { type: 'OrFilter', config: configFilters };
			fetchParams.dataInputFilters.forEach((aFilter: IDataInputFilterValue) => {
				const sensorTypeFilter = {
					type: 'StringInFilter',
					field_name: 'item_type',
					config: [aFilter.sensorType]
				};
				if (Boolean(aFilter.sensorName)) {
					configFilters.push({
						type: 'AndFilter', config: [
							sensorTypeFilter,
							{ type: 'StringInFilter', field_name: 'satellite_id', config: [aFilter.sensorName] }
						]
					});
				} else {
					configFilters.push(sensorTypeFilter);
				}
			});

			filters.push(preFilter);
		}

		return this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters(filters, fetchParams.sensors),
			{ headers: this.httpHeaders, params: { _page_size: limit } }).pipe(
			map((data: IOverlaysPlanetFetchData): any => this.extractArrayData(data.features)),
			map((overlays: IOverlay[]): any => <IOverlaysPlanetFetchData> limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: HttpResponseBase | any): any => {
				return this.errorHandlerService.httpErrorHandle(error);
			}));
	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		const baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		const body = this.buildFilters([{ type: 'StringInFilter', field_name: 'id', config: [id] }]);
		return this.http.post<IOverlaysPlanetFetchData>(baseUrl, body, { headers: this.httpHeaders }).pipe(
			map(data => {
				if (data.features.length <= 0) {
					throw new HttpErrorResponse({ status: 404 });
				}

				return this.extractData(data.features);
			}),
			catchError((error: HttpErrorResponse) => {
				return throwError(error);
			}));
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		const baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		const filters = this.parsePlanetFilters(params.facets);
		const bboxFilter = this._getBboxFilter(params.region);

		const dateFilter = {
			type: 'DateRangeFilter', field_name: 'acquired',
			config: { gte: new Date(0).toISOString(), lte: new Date().toISOString() }
		};
		const pageLimit: any = params.limit ? params.limit : DEFAULT_OVERLAYS_LIMIT;

		return this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters([...filters, bboxFilter, dateFilter]),
			{ headers: this.httpHeaders, params: { _page_size: pageLimit } })
			.pipe(
				map((data: IOverlaysPlanetFetchData) => this.extractArrayData(data.features)),
				map((overlays: IOverlay[]): IStartAndEndDate => {
					let startDate: string, endDate: string;
					if (overlays.length === 0) {
						startDate = moment().subtract(1, 'month').toISOString();  // month ago
						endDate = new Date().toISOString();
					} else {
						const overlaysDates = overlays.map(overlay => moment(overlay.date));
						startDate = moment.min(overlaysDates).toISOString();
						endDate = moment.max(overlaysDates).toISOString();
					}
					return { startDate, endDate };
				})
			)
			.pipe<any>(catchError((error: HttpResponseBase | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			}));
	}

	private _getBboxFilter(region: {type}): {type; field_name; config} {
		let fetchRegion = region;
		if (fetchRegion.type === 'MultiPolygon') {
			fetchRegion = geojsonMultiPolygonToPolygon(fetchRegion as GeoJSON.MultiPolygon);
		}
		return { type: 'GeometryFilter', field_name: 'geometry', config: fetchRegion };
	}

	public parsePlanetFilters(facets = { filters: [] }): IPlanetFilter[] {
		if (Object.getOwnPropertyNames(facets).length === 0) {
			return [];
		}

		return facets.filters.map(filterObj => {
			if (filterObj.fieldName === 'bestResolution') {
				return {
					type: 'RangeFilter',
					field_name: this.planetDic[filterObj.fieldName],
					config: { lte: filterObj.metadata.end, gte: filterObj.metadata.start }
				};
			}
			return {
				type: 'StringInFilter',
				field_name: this.planetDic[filterObj.fieldName],
				config: filterObj.metadata
			};
		});
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<IStartAndEndDate> {
		const baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		const filters = this.parsePlanetFilters(params.facets);
		const bboxFilter = this._getBboxFilter(params.region);

		let dateFilter = {
			type: 'DateRangeFilter', field_name: 'acquired',
			config: { gte: new Date(0).toISOString(), lte: new Date(params.date).toISOString() }
		};
		let pageLimit: any = params.limitBefore ? params.limitBefore : DEFAULT_OVERLAYS_LIMIT / 2;

		const startDate$: Observable<Date> = this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters([...filters, bboxFilter, dateFilter]),
			{ headers: this.httpHeaders, params: { _page_size: pageLimit } }).pipe<any>(
			map((data: IOverlaysPlanetFetchData) => this.extractArrayData(data.features)),
			map((overlays: IOverlay[]) => {
				let startDate: Date;
				if (overlays.length === 0) {
					startDate = moment(params.date).subtract(1, 'month').toDate();  // a month before
				} else {
					const overlaysDates = overlays.map(overlay => moment(overlay.date));
					startDate = moment.min(overlaysDates).toDate();
				}
				return startDate;
			}),
			catchError((error: HttpResponseBase | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			}));

		dateFilter = {
			type: 'DateRangeFilter', field_name: 'acquired',
			config: { gte: new Date(params.date).toISOString(), lte: new Date().toISOString() }
		};
		pageLimit = params.limitAfter ? params.limitAfter : DEFAULT_OVERLAYS_LIMIT / 2;

		const endDate$: Observable<Date> = this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters([...filters, bboxFilter, dateFilter]),
			{ headers: this.httpHeaders, params: { _page_size: pageLimit } }).pipe<any>(
			map((data: IOverlaysPlanetFetchData) => this.extractArrayData(data.features)),
			map((overlays: IOverlay[]) => {
				let endDate: Date;
				if (overlays.length === 0) {
					endDate = moment.min([moment(params.date).add(1, 'month'), moment()]).toDate();  // a month after
				} else {
					const overlaysDates = overlays.map(overlay => moment(overlay.date));
					endDate = moment.max(overlaysDates).toDate();
				}
				return endDate;
			}),
			catchError((error: HttpResponseBase | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			}));

		return forkJoin(startDate$, endDate$).pipe(
			map(([start, end]: [Date, Date]) => ({startDate: start.toISOString(), endDate: end.toString()})));
	}

	private extractArrayData(overlays: PlanetOverlay[]): IOverlay[] {
		if (!overlays) {
			return [];
		}

		return overlays.filter(meta => meta.properties)
			.map((element) => this.parseData(element));
	}

	private extractData(overlays: Array<any>): IOverlay {
		if (overlays.length > 0) {
			return this.parseData(overlays[0]);
		}
	}

	protected parseData(element: PlanetOverlay): IOverlay {
		const overlay: IOverlay = <IOverlay> {};

		overlay.id = element.id;
		overlay.footprint = element.geometry.type === 'MultiPolygon' ? element.geometry : geojsonPolygonToMultiPolygon(element.geometry);
		overlay.sensorType = element.properties.item_type;
		overlay.sensorName = element.properties.satellite_id;
		overlay.bestResolution = element.properties.gsd;
		overlay.name = element.id;
		overlay.imageUrl = this.appendApiKey(
			`${this.planetOverlaysSourceConfig.tilesUrl}${overlay.sensorType}/${overlay.id}/{z}/{x}/{y}.png`);
		overlay.thumbnailUrl = this.appendApiKey(element._links.thumbnail);
		overlay.date = new Date(element.properties.acquired);
		overlay.photoTime = element.properties.acquired;
		overlay.azimuth = toRadians(element.properties.view_angle);
		overlay.sourceType = this.sourceType;
		overlay.isGeoRegistered = true;
		overlay.tag = element;

		return overlay;
	}
}
