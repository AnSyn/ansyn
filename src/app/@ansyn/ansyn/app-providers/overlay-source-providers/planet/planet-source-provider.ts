import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays/index';
import { Observable } from 'rxjs/Observable';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { ErrorHandlerService, Overlay } from '@ansyn/core/index';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';
import { geojsonMultiPolygonToPolygon, geojsonPolygonToMultiPolygon } from '@ansyn/core/utils/geo';
import { limitArray } from '@ansyn/core/utils/limited-array';
import { toRadians } from '@ansyn/core/utils/math';
import { HttpResponseBase } from '@angular/common/http/src/response';
import { OverlaysPlanetFetchData, PlanetOverlay } from './planet.model';

const DEFAULT_OVERLAYS_LIMIT = 249;
export const PlanetOverlaySourceType = 'PLANET';

export const PlanetOverlaysSourceConfig: InjectionToken<IPlanetOverlaySourceConfig> = new InjectionToken('planet-overlays-source-config');

export interface IPlanetOverlaySourceConfig {
	baseUrl: string;
	itemTypes: string[];
	apiKey: string;
	tilesUrl: string;
}

interface IPlanetFilter {
	type: string,
	field_name: string,
	config: object;
}

@Injectable()
export class PlanetSourceProvider extends BaseOverlaySourceProvider {
	sourceType = PlanetOverlaySourceType;
	private httpHeaders: HttpHeaders;


	constructor(public errorHandlerService: ErrorHandlerService,
				protected http: HttpClient,
				@Inject(PlanetOverlaysSourceConfig)
				protected planetOverlaysSourceConfig: IPlanetOverlaySourceConfig) {
		super();

		this.httpHeaders = new HttpHeaders({ Authorization:
				`basic ${btoa((this.planetOverlaysSourceConfig.apiKey + ':'))}` });
	}

	buildFilters(config: IPlanetFilter[]) {
		return {
			item_types: this.planetOverlaysSourceConfig.itemTypes,
			filter: {
				type: 'AndFilter',
				config: config
			}
		}
	}

	appendApiKey(url: string) {
		return `${url}?api_key=${this.planetOverlaysSourceConfig.apiKey}`;
	}

	fetch(fetchParams: IFetchParams): Observable<OverlaysPlanetFetchData> {
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}
		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		let baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const limit = `${fetchParams.limit + 1}`;

		const bboxFilter = { type: 'GeometryFilter', field_name: 'geometry', config: fetchParams.region };
		const dateFilter = { type: 'DateRangeFilter', field_name: 'acquired',
			config: { gte: fetchParams.timeRange.start.toISOString(), lte: fetchParams.timeRange.end.toISOString()}};

		return this.http.post<OverlaysPlanetFetchData>(baseUrl, this.buildFilters([ bboxFilter, dateFilter ]),
			{ headers: this.httpHeaders, params: { _page_size: limit }})
			.map((data: OverlaysPlanetFetchData) => this.extractArrayData(data.features))
			.map((overlays: Overlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
			.catch((error: HttpResponseBase | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	getById(id: string, sourceType: string): Observable<Overlay> {
		const baseUrl = this.planetOverlaysSourceConfig.baseUrl;
		const body = this.buildFilters([{type: 'StringInFilter', field_name: 'id', config: [id]}]);
		return this.http.post<OverlaysPlanetFetchData>(baseUrl, body, { headers: this.httpHeaders})
			.map(data => this.extractData(data.features))
			.catch((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<StartAndEndDate> {
		return Observable.empty();
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return Observable.empty();
	}

	private extractArrayData(overlays: PlanetOverlay[]): Overlay[] {
		if (!overlays) {
			return [];
		}

		return overlays.filter(meta => meta.properties)
			.map((element) => this.parseData(element));
	}

	private extractData(overlays: Array<any>): Overlay {
		if (overlays.length > 0) {
			return this.parseData(overlays[0]);
		}
	}

	protected parseData(element: PlanetOverlay): Overlay {
		const overlay: Overlay = new Overlay();

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

		return overlay;
	}
}
