import { Inject } from '@angular/core';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate, OverlaySourceProvider } from '@ansyn/overlays';
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
import { HttpClient } from '@angular/common/http';
import { empty, Observable } from 'rxjs';
import * as wellknown from 'wellknown';
import { catchError, map } from 'rxjs/operators';

const DEFAULT_OVERLAYS_LIMIT = 500;
export const OpenAerialOverlaySourceType = 'OPEN_AERIAL';

export const OpenAerialOverlaysSourceConfig = 'openAerialOverlaysSourceConfig';

export interface IOpenAerialOverlaySourceConfig {
	baseUrl: string;
}

@OverlaySourceProvider({
	sourceType: OpenAerialOverlaySourceType
})
export class OpenAerialSourceProvider extends BaseOverlaySourceProvider {

	constructor(public errorHandlerService: ErrorHandlerService,
				protected loggerService: LoggerService,
				protected http: HttpClient,
				@Inject(OpenAerialOverlaysSourceConfig)
				protected openAerialOverlaysSourceConfig: IOpenAerialOverlaySourceConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
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
		let baseUrl = this.openAerialOverlaysSourceConfig.baseUrl;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const params = {
			platform: 'uav',
			limit: `${fetchParams.limit + 1}`,
			bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
			acquisition_from: fetchParams.timeRange.start.toISOString(),
			acquisition_to: fetchParams.timeRange.end.toISOString()
		};

		return this.http.get<any>(baseUrl, { params: params }).pipe(
			map(data => {
				return this.extractArrayData(data.results);
			}),
			map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);
	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		let baseUrl = this.openAerialOverlaysSourceConfig.baseUrl;
		return this.http.get<any>(baseUrl, { params: { _id: id } }).pipe <any>(
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

		return overlays.filter(meta => meta.properties && meta.properties.tms && !meta.properties.tms.includes('mapbox'))
			.map((element) => this.parseData(element));
	}

	private extractData(overlays: Array<any>): IOverlay {
		if (overlays.length > 0) {
			return this.parseData(overlays[0]);
		}
	}

	protected parseData(openAerialElement: any): IOverlay {
		const footprint: any = wellknown.parse(openAerialElement.footprint);
		return new Overlay({
			id: openAerialElement._id,
			footprint: geojsonPolygonToMultiPolygon(footprint.geometry ? footprint.geometry : footprint),
			sensorType: openAerialElement.platform,
			sensorName: openAerialElement.properties.sensor,
			bestResolution: openAerialElement.gsd,
			name: openAerialElement.title,
			imageUrl: openAerialElement.properties.tms,
			thumbnailUrl: openAerialElement.properties.thumbnail,
			date: new Date(openAerialElement.acquisition_end),
			photoTime: openAerialElement.acquisition_end,
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: true,
			tag: openAerialElement
		});

	}
}
