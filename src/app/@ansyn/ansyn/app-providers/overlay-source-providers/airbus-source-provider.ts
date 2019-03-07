import { Inject } from '@angular/core';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate, OverlaySourceProvider } from '@ansyn/overlays';
import {
	bboxFromGeoJson,
	ErrorHandlerService,
	geojsonMultiPolygonToPolygon, geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius, IMapSourceProvidersConfig,
	IOverlay,
	limitArray,
	LoggerService, MAP_SOURCE_PROVIDERS_CONFIG,
	Overlay,
	sortByDateDesc,
	toRadians
} from '@ansyn/core';
import { HttpClient } from '@angular/common/http';
import { empty, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const DEFAULT_OVERLAYS_LIMIT = 200;
export const AirbusSourceProviderType = 'AIRBUS';

export const AirbusOverlaysSourceConfig = 'airbusOverlaysSourceConfig';

export interface IAirbusOverlaySourceConfig {
	baseUrl: string;
}

@OverlaySourceProvider({
	sourceType: AirbusSourceProviderType
})
export class AirbusSourceProvider extends BaseOverlaySourceProvider {
	get config(): IAirbusOverlaySourceConfig {
		return this.mapSourceProvidersConfig[this.sourceType];
	}

	constructor(public errorHandlerService: ErrorHandlerService,
				protected loggerService: LoggerService,
				protected http: HttpClient,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
		console.log('params', fetchParams);

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
		let baseUrl = this.config.baseUrl;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const params = {
			bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
			start: fetchParams.timeRange.start.toISOString(),
			end: fetchParams.timeRange.end.toISOString(),
		};

		return this.http.get<any>(`${baseUrl}/search`, { params: params }).pipe(
			map(data => {
				return this.extractArrayData(data.features);
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
		let baseUrl = this.config.baseUrl;
		return this.http.get<any>(baseUrl, { params: { _id: id } }).pipe(
			map(data => {
				return this.extractData(data);
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

		return overlays.filter(meta => meta.properties && meta.properties.tileEngineUrl && meta.geometry)
			.map((element) => this.extractData(element));
	}

	private extractData(overlay: any): IOverlay {
		return this.parseData(overlay)
	}

	protected parseData(airbusElement: any): IOverlay {
		const base = airbusElement.properties.tileEngineUrl;
		return new Overlay({
			id: airbusElement.id,
			footprint: geojsonPolygonToMultiPolygon(airbusElement.geometry),
			sensorType: airbusElement.properties.provider,
			sensorName: airbusElement.properties.instrument,
			bestResolution: airbusElement.properties.resolution,
			name: airbusElement.properties.sourceId,
			imageUrl: base,
			thumbnailUrl: this.config.baseUrl + '/xyz?original=' + base.replace('/{z}/{x}/{y}', '/5/16/11'),
			date: new Date(airbusElement.properties.acquisitionDate),
			photoTime: airbusElement.properties.acquisitionDate,
			azimuth: toRadians(airbusElement.properties.illuminationAzimuthAngle),
			sourceType: this.sourceType,
			isGeoRegistered: true,
			tag: airbusElement
		});

	}
}
