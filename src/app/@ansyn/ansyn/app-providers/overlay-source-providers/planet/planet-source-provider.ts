import { forkJoin, Observable } from 'rxjs';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IOverlayByIdMetaData,
	IOverlayFilter,
	IStartAndEndDate,
	OverlaySourceProvider,
	timeIntersection
} from '../../../modules/overlays/public_api';
import { Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
	ErrorHandlerService,
	IMultipleOverlaysSourceConfig,
	limitArray,
	LoggerService, MultipleOverlaysSourceConfig,
	sortByDateDesc,
	toRadians
} from '../../../modules/core/public_api';
import {
	geojsonMultiPolygonToPolygon,
	geojsonPolygonToMultiPolygon, GeoRegisteration,
	IDataInputFilterValue,
	IOverlay,
} from '@ansyn/imagery';
import { HttpResponseBase } from '@angular/common/http/src/response';
import { IOverlaysPlanetFetchData, PlanetOverlay } from './planet.model';
import { catchError, map } from 'rxjs/operators';
/* Do not change this ( rollup issue ) */
import * as momentNs from 'moment';
import { feature, intersect } from '@turf/turf';
import { isEqual, uniq } from 'lodash';
import { Overlay } from '@ansyn/imagery';

const moment = momentNs;

const DEFAULT_OVERLAYS_LIMIT = 249;
export const PlanetOverlaySourceType = 'PLANET';

export const PlanetOverlaysSourceConfig = 'planetOverlaysSourceConfig';

export interface IPlanetOverlaySourceConfig {
	baseUrl: string;
	itemTypes: string[];
	apiKey: string;
	tilesUrl: string;
	delayMultiple: number;
}

export interface IPlanetFilter {
	type: string,
	field_name?: string,
	config: any | Array<IPlanetFilter>;
}

export interface IPlanetFetchParams extends IFetchParams {
	planetFilters: IPlanetFilter[]
}

@OverlaySourceProvider({
	sourceType: PlanetOverlaySourceType
})
export class PlanetSourceProvider extends BaseOverlaySourceProvider {
	readonly httpHeaders: HttpHeaders;

	protected planetDic = {
		'sensorType': 'item_type',
		'sensorName': 'satellite_id',
		'photoTime': 'acquired',
		'bestResolution': 'gsd'
	};

	constructor(public errorHandlerService: ErrorHandlerService,
				protected http: HttpClient,
				@Inject(PlanetOverlaysSourceConfig) protected planetOverlaysSourceConfig: IPlanetOverlaySourceConfig,
				@Inject(MultipleOverlaysSourceConfig) protected multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				protected loggerService: LoggerService) {
		super(loggerService);
		this.httpHeaders = new HttpHeaders({
			Authorization:
				`basic ${btoa((this.planetOverlaysSourceConfig.apiKey + ':'))}`
		});
	}

	buildFilters({ config, sensors, type = 'AndFilter' }: { config: IPlanetFilter | IPlanetFilter[], sensors?: string[], type?: 'AndFilter' | 'OrFilter' }) {
		return {
			item_types: Array.isArray(sensors) ? sensors : this.planetOverlaysSourceConfig.itemTypes,
			filter: { type, config }
		};
	}

	appendApiKey(url: string) {
		return `${url}?api_key=${this.planetOverlaysSourceConfig.apiKey}`;
	}

	buildDataInputFilter(dataInputFilters: IDataInputFilterValue[]): IPlanetFilter {
		return {
			type: 'OrFilter',
			config: dataInputFilters.map((aFilter: IDataInputFilterValue) => {
				const sensorTypeFilter = {
					type: 'StringInFilter',
					field_name: 'item_type',
					config: [aFilter.sensorType]
				};
				if (Boolean(aFilter.sensorName)) {
					return {
						type: 'AndFilter', config: [
							sensorTypeFilter,
							{ type: 'StringInFilter', field_name: 'satellite_id', config: [aFilter.sensorName] }
						]
					};
				}
				return sensorTypeFilter;
			})
		};
	}

	buildFetchObservables(fetchParams: IFetchParams, filters: IOverlayFilter[]): Observable<any>[] {
		const regionFeature = feature(<any>fetchParams.region);
		const fetchParamsTimeRange = {
			start: new Date(fetchParams.timeRange.start),
			end: new Date(fetchParams.timeRange.end)
		};

		const planetFilters: IPlanetFilter[] = filters
			.map(({ sensor, ...restItem }) => ({ ...restItem, sensors: sensor ? [sensor] : [] }))
			.reduce((res, item) => {
				const equalItem = res.find((f) => isEqual({
					coverage: f.coverage,
					timeRange: f.timeRange
				}, { coverage: item.coverage, timeRange: item.timeRange }));
				if (equalItem) {
					equalItem.sensors = uniq([...equalItem.sensors, ...item.sensors]);
					return res;
				}
				return [...res, item];
			}, [])
			.map((item): Partial<IFetchParams> => {
				const intersection = intersect(regionFeature, item.coverage);
				const time = timeIntersection(fetchParamsTimeRange, item.timeRange);
				const { sensors } = item;
				return {
					timeRange: time,
					region: intersection && intersection.geometry,
					sensors
				};
			})
			.filter(({ timeRange, region }: IFetchParams) => Boolean(timeRange && region))
			.map(this.paramsToFilter);
		if (!planetFilters.length) {
			return [];
		}
		return [this.fetch(<any>{
			...fetchParams,
			planetFilters
		})];
	}

	paramsToFilter(fetchParams: IFetchParams): IPlanetFilter {

		const filters: IPlanetFilter = {
			type: 'AndFilter',
			config: [
				{
					type: 'GeometryFilter',
					field_name: 'geometry',
					config: fetchParams.region
				},
				{
					type: 'DateRangeFilter',
					field_name: 'acquired',
					config: {
						gte: fetchParams.timeRange.start.toISOString(),
						lte: fetchParams.timeRange.end.toISOString()
					}
				}
			]
		};
		if (fetchParams.sensors.length) {
			filters.config.push({
				type: 'StringInFilter',
				field_name: 'item_type',
				config: fetchParams.sensors
			});
		}
		return filters;
	}

	fetch(fetchParams: IPlanetFetchParams): Observable<IOverlaysPlanetFetchData> {
		const { planetFilters } = fetchParams;

		if (!fetchParams.limit) {
			fetchParams.limit = DEFAULT_OVERLAYS_LIMIT;
		}

		// add 1 to limit - so we'll know if provider have more then X overlays
		const _page_size = `${fetchParams.limit + 1}`;
		let sensors = Array.isArray(fetchParams.sensors) ? fetchParams.sensors : this.planetOverlaysSourceConfig.itemTypes;

		if (Array.isArray(fetchParams.dataInputFilters) && fetchParams.dataInputFilters.length > 0) {
			const parsedDataInput = fetchParams.dataInputFilters.map(({ sensorType }) => sensorType).filter(Boolean);
			if (fetchParams.dataInputFilters.some(({ sensorType }) => sensorType === 'others')) {
				const allDataInput = this.multipleOverlaysSourceConfig[this.sourceType].dataInputFiltersConfig.children.map(({ value }) => value.sensorType);
				sensors = sensors.filter((sens) => parsedDataInput.includes(sens) || !allDataInput.includes(sens));
			} else {
				sensors = parsedDataInput;
			}
		}

		const { baseUrl } = this.planetOverlaysSourceConfig;
		const body = this.buildFilters({ config: planetFilters, sensors, type: 'OrFilter' });
		const options = { headers: this.httpHeaders, params: { _page_size } };
		return this.http.post(baseUrl, body, options).pipe(
			map((data: IOverlaysPlanetFetchData) => this.extractArrayData(data.features)),
			map((overlays: IOverlay[]) => <IOverlaysPlanetFetchData> limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: HttpResponseBase | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);
	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		const baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		const body = this.buildFilters({ config: [{ type: 'StringInFilter', field_name: 'id', config: [id] }] });
		return this.http.post<IOverlaysPlanetFetchData>(baseUrl, body, { headers: this.httpHeaders }).pipe(
			map(data => {
				if (data.features.length <= 0) {
					throw new HttpErrorResponse({ status: 404 });
				}
				return this.extractData(data.features);
			})
		);
	}

	getByIds(ids: IOverlayByIdMetaData[]) {
		const { baseUrl } = this.planetOverlaysSourceConfig;
		const body = this.buildFilters({
			config: [{
				type: 'StringInFilter',
				field_name: 'id',
				config: ids.map(({ id }) => id)
			}]
		});
		return this.http.post<IOverlaysPlanetFetchData>(baseUrl, body, { headers: this.httpHeaders }).pipe(
			map(data => {
				if (data.features.length < ids.length) {
					throw new HttpErrorResponse({ status: 404 });
				}
				return data.features.map((overlay) => this.parseData(overlay));
			})
		);
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

		return this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters({ config: [...filters, bboxFilter, dateFilter] }),
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
				}),
				catchError((error: HttpResponseBase | any) => {
					return this.errorHandlerService.httpErrorHandle(error);
				})
			);
	}

	private _getBboxFilter(region: { type }): { type; field_name; config } {
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

		const startDate$: Observable<Date> = this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters({ config: [...filters, bboxFilter, dateFilter] }),
			{ headers: this.httpHeaders, params: { _page_size: pageLimit } }).pipe(
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
			})
		);

		dateFilter = {
			type: 'DateRangeFilter', field_name: 'acquired',
			config: { gte: new Date(params.date).toISOString(), lte: new Date().toISOString() }
		};
		pageLimit = params.limitAfter ? params.limitAfter : DEFAULT_OVERLAYS_LIMIT / 2;

		const endDate$: Observable<Date> = this.http.post<IOverlaysPlanetFetchData>(baseUrl, this.buildFilters({ config: [...filters, bboxFilter, dateFilter] }),
			{ headers: this.httpHeaders, params: { _page_size: pageLimit } }).pipe(
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
			})
		);

		return forkJoin(startDate$, endDate$).pipe(
			map(([start, end]: [Date, Date]) => ({ startDate: start.toISOString(), endDate: end.toString() }))
		);
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
		return new Overlay({
			id: element.id,
			footprint: element.geometry.type === 'MultiPolygon' ? element.geometry : geojsonPolygonToMultiPolygon(element.geometry),
			sensorType: element.properties.item_type,
			sensorName: element.properties.satellite_id,
			bestResolution: element.properties.gsd,
			cloudCoverage: element.properties.cloud_cover,
			name: element.id,
			imageUrl: this.appendApiKey(
				`${this.planetOverlaysSourceConfig.tilesUrl}${element.properties.item_type}/${element.id}/{z}/{x}/{y}.png`),
			thumbnailUrl: this.appendApiKey(element._links.thumbnail),
			date: new Date(element.properties.acquired),
			photoTime: element.properties.acquired,
			azimuth: toRadians(element.properties.view_angle),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: element
		});

	}
}
