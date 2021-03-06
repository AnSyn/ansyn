import { forkJoin, Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
	geojsonMultiPolygonToFirstPolygon,
	geojsonPolygonToMultiPolygon,
	getPointByGeometry,
	toRadians
} from '@ansyn/imagery';
import { HttpResponseBase } from '@angular/common/http';
import { IOverlaysPlanetFetchData, PlanetOverlay } from './planet.model';
import { catchError, debounceTime, map } from 'rxjs/operators';
/* Do not change this ( rollup issue ) */
import * as momentNs from 'moment';
import { feature, intersect } from '@turf/turf';
import { isEqual, uniq } from 'lodash';
import { ErrorHandlerService } from '../../../modules/core/services/error-handler.service';
import {
	IMultipleOverlaysSourceConfig,
	MultipleOverlaysSourceConfig
} from '../../../modules/core/models/multiple-overlays-source-config';
import { limitArray } from '../../../modules/core/utils/i-limited-array';
import { LoggerService } from '../../../modules/core/services/logger.service';
import { sortByDateDesc } from '../../../modules/core/utils/sorting';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IOverlayFilter,
	IStartAndEndDate,
	timeIntersection
} from '../../../modules/overlays/models/base-overlay-source-provider.model';
import { OverlaySourceProvider } from '../../../modules/overlays/models/overlays-source-providers';
import { IOverlayByIdMetaData } from '../../../modules/overlays/services/overlays.service';
import { GeoRegisteration, IOverlay, Overlay } from '../../../modules/overlays/models/overlay.model';

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
				`basic ${ btoa((this.planetOverlaysSourceConfig.apiKey + ':')) }`
		});
	}

	buildFilters({ config, sensors, type = 'AndFilter' }: { config: IPlanetFilter | IPlanetFilter[], sensors?: string[], type?: 'AndFilter' | 'OrFilter' }) {
		return {
			item_types: Array.isArray(sensors) ? sensors : this.planetOverlaysSourceConfig.itemTypes,
			filter: { type, config }
		};
	}

	appendApiKey(url: string) {
		return `${ url }?api_key=${ this.planetOverlaysSourceConfig.apiKey }`;
	}

	// in case we return to prefilter sourceType
	/*buildDataInputFilter(dataInputFilters: IDataInputFilterValue[]): IPlanetFilter {
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
	}*/

	buildFetchObservables(fetchParams: IFetchParams): Observable<any>[] {
		const regionFeature = feature(<any>fetchParams.region);
		const fetchParamsTimeRange = {
			start: new Date(fetchParams.timeRange.start),
			end: new Date(fetchParams.timeRange.end)
		};
		
		return [this.fetch(<any>{
			...fetchParams
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
		const _page_size = `${ fetchParams.limit + 1 }`;
		let sensors = Array.isArray(fetchParams.sensors) ? fetchParams.sensors : this.planetOverlaysSourceConfig.itemTypes;
		// in case we return to prefilter sourceType
		/*if (Array.isArray(fetchParams.dataInputFilters) && fetchParams.dataInputFilters.length > 0) {
			const parsedDataInput = fetchParams.dataInputFilters.map(({ sensorType }) => sensorType).filter(Boolean);
			if (fetchParams.dataInputFilters.some(({ sensorType }) => sensorType === 'others')) {
				const allDataInput = this.multipleOverlaysSourceConfig.indexProviders[this.sourceType].dataInputFiltersConfig.children.map(({ value }) => value.sensorType);
				sensors = sensors.filter((sens) => parsedDataInput.includes(sens) || !allDataInput.includes(sens));
			} else {
				sensors = parsedDataInput;
			}
		}*/
		const { baseUrl } = this.planetOverlaysSourceConfig;
		const body = this.buildFilters({ config: planetFilters, sensors, type: 'OrFilter' });
		const options = { headers: this.httpHeaders, params: { _page_size } };
		return this.http.post(baseUrl, body, options).pipe(
			debounceTime(200),
			map((data: IOverlaysPlanetFetchData) => this.extractArrayData(data.features)),
			map((overlays: IOverlay[]) => <IOverlaysPlanetFetchData>limitArray(overlays, fetchParams.limit, {
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

	private _getBboxFilter(region: { type }): { type; field_name; config } {
		let fetchRegion = region;
		if (fetchRegion.type === 'MultiPolygon') {
			fetchRegion = geojsonMultiPolygonToFirstPolygon(fetchRegion as GeoJSON.MultiPolygon);
		}
		return { type: 'GeometryFilter', field_name: 'geometry', config: fetchRegion };
	}

	public parsePlanetFilters(facets = { filters: [] }): IPlanetFilter[] {
		if (Object.getOwnPropertyNames(facets).length === 0) {
			return [];
		}

		facets.filters.forEach(filter => {
			if (filter.metadata.unCheckedEnums) {
				const metaData = filter.metadata;
				filter.metadata = [...metaData.disabledEnums, ...metaData.unCheckedEnums]
			}
		});
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
				`${ this.planetOverlaysSourceConfig.tilesUrl }${ element.properties.item_type }/${ element.id }/{z}/{x}/{y}.png`),
			thumbnailUrl: this.appendApiKey(element._links.thumbnail),
			date: new Date(element.properties.acquired),
			photoTime: element.properties.acquired,
			azimuth: toRadians(element.properties.view_angle),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: element,
			sensorLocation: this.multipleOverlaysSourceConfig.useAngleDebugMode ? getPointByGeometry(element.geometry) : undefined
		});

	}
}
