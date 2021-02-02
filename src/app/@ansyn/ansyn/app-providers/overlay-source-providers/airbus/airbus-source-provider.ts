import { Inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { empty, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
	bboxFromGeoJson, geojsonMultiPolygonToPolygons,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG, toRadians
} from '@ansyn/imagery';
import { OverlaySourceProvider } from '../../../modules/overlays/models/overlays-source-providers';
import {
	BaseOverlaySourceProvider,
	IFetchParams, IStartAndEndDate
} from '../../../modules/overlays/models/base-overlay-source-provider.model';
import { ErrorHandlerService } from '../../../modules/core/services/error-handler.service';
import { LoggerService } from '../../../modules/core/services/logger.service';
import { GeoRegisteration, IOverlay, Overlay } from '../../../modules/overlays/models/overlay.model';
import { limitArray } from '../../../modules/core/utils/i-limited-array';
import { sortByDateDesc } from '../../../modules/core/utils/sorting';

const DEFAULT_OVERLAYS_LIMIT = 200;
export const AirbusSourceProviderType = 'AIRBUS';

export const airbusOverlaySourceConfig = 'airbusOverlaysSourceConfig';

export interface IAirbusOverlaySourceConfig {
	baseUrl: string;
}
@OverlaySourceProvider({
	sourceType: AirbusSourceProviderType
})
export class AirbusSourceProvider extends BaseOverlaySourceProvider {

	constructor(public errorHandlerService: ErrorHandlerService,
				protected loggerService: LoggerService,
				protected http: HttpClient,
				@Inject(airbusOverlaySourceConfig) protected config: IAirbusOverlaySourceConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygons(fetchParams.region as GeoJSON.MultiPolygon)[0];
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
		const url = airbusElement.properties.tileEngineUrl;
		return new Overlay({
			id: airbusElement.id,
			footprint: geojsonPolygonToMultiPolygon(airbusElement.geometry),
			sensorType: airbusElement.properties.provider,
			sensorName: airbusElement.properties.instrument,
			bestResolution: airbusElement.properties.resolution,
			name: airbusElement.properties.sourceId,
			imageUrl: `${this.config.baseUrl}/xyz?original=${url}`,
			thumbnailUrl: this.config.baseUrl + '/xyz?original=' + url.replace('/{z}/{x}/{y}', '/5/16/11'),
			date: new Date(airbusElement.properties.acquisitionDate),
			photoTime: airbusElement.properties.acquisitionDate,
			azimuth: toRadians(airbusElement.properties.illuminationAzimuthAngle),
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.geoRegistered,
			tag: airbusElement
		});

	}
}
