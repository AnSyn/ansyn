import { Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
	bboxFromGeoJson,
	geojsonMultiPolygonToFirstPolygon,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG,
	toRadians,
} from '@ansyn/imagery';
import { empty, Observable } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';
import OLGeoJSON from 'ol/format/GeoJSON';
import { Store } from '@ngrx/store';
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

const DEFAULT_OVERLAYS_LIMIT = 50;
export const SentinelOverlaySourceType = 'SENTINEL';

export interface ISentinelOverlaySourceConfig {
	baseUrl: string;
}

@OverlaySourceProvider({
	sourceType: SentinelOverlaySourceType
})
export class SentinelSourceProvider extends BaseOverlaySourceProvider {
	private olGeoJSON: OLGeoJSON = new OLGeoJSON();

	get config(): ISentinelOverlaySourceConfig {
		return this.mapSourceProvidersConfig[this.sourceType];
	}

	constructor(public errorHandlerService: ErrorHandlerService,
				protected loggerService: LoggerService,
				protected http: HttpClient,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
				protected store: Store<any>) {
		super(loggerService);
		proj4.defs('EPSG:32636', '+proj=utm +zone=36 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
		proj4.defs('EPSG:32637', '+proj=utm +zone=37 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
		register(proj4);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		// let search = `${this.config.search}${fetchParams.dataInputFilters[0].sensorType}/searchIndex`;
		const search = `${ this.config.baseUrl }/search`;
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToFirstPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}
		let bbox;

		if (fetchParams.region.type === 'Point') {
			bbox = bboxFromGeoJson(getPolygonByPointAndRadius((<any>fetchParams.region).coordinates).geometry as GeoJSON.Polygon);
		} else {
			bbox = bboxFromGeoJson(fetchParams.region as GeoJSON.Polygon);
		}
		// bbox = proj.transform(bbox, 'EPSG:4326', 'EPSG:3857');
		const { start, end } = fetchParams.timeRange;
		const params = {
			region: fetchParams.region,
			start,
			end,
			limit: 250,
			plate: 'Sentinel-2'
		};
		return this.http.post<any>(search, params, { responseType: 'json' }).pipe(
			map(data => {
				return this.extractArrayData(data.features);
			}),
			map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			timeout(15000),
			catchError((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);
	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		let baseUrl = this.config.baseUrl + '/search?id=' + id;
		return this.http.get<any>(baseUrl).pipe(
			map(data => {
				return this.extractData(data.results);
			}),
			catchError((error: any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);
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

		return overlays.map((element) => this.extractData(element));
	}

	private extractData(overlays: any): IOverlay {
		return this.parseData(overlays);

	}

	getThumbnailName(overlay): string {
		const superName = super.getThumbnailName(overlay);
		return superName.length > 20 ? `...${ superName.substring(0, 15) }` : superName;
	}

	protected parseData(sentinelElement: any): IOverlay {
		const time = new Date(sentinelElement.properties.ingestiondate);
		let geometry = sentinelElement.geometry;
		if (geometry.type !== 'MultiPolygon') {
			geometry = geojsonPolygonToMultiPolygon(geometry);
		}
		return new Overlay({
			id: sentinelElement.properties.id,
			footprint: geometry,
			sensorType: sentinelElement.properties.producttype,
			sensorName: sentinelElement.properties.instrumentname,
			cloudCoverage: sentinelElement.properties.cloudcoverpercentage / 100,
			bestResolution: 1,
			name: sentinelElement.properties.identifier,
			imageUrl: this.config.baseUrl + '/wms',
			thumbnailUrl: this.config.baseUrl + `/thumbnail/${ sentinelElement.properties.id }`,
			date: time,
			photoTime: time.toISOString(),
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: sentinelElement
		});
	}
}
