import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
	BaseOverlaySourceProvider, IFetchParams,
	IStartAndEndDate
} from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	bboxFromGeoJson, geojsonMultiPolygonToPolygon, geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius
} from '@ansyn/core/utils/geo';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';
import { limitArray } from '@ansyn/core/utils/i-limited-array';
import { toRadians } from '@ansyn/core/utils/math';
import * as wellknown from "wellknown";
import { LoggerService } from '@ansyn/core/services/logger.service';
import { empty } from 'rxjs';

const DEFAULT_OVERLAYS_LIMIT = 500;
export const OpenAerialOverlaySourceType = 'OPEN_AERIAL';

export const OpenAerialOverlaysSourceConfig: InjectionToken<IOpenAerialOverlaySourceConfig> = new InjectionToken('open-aerial-overlays-source-config');

export interface IOpenAerialOverlaySourceConfig {
	baseUrl: string;
}

@Injectable()
export class OpenAerialSourceProvider extends BaseOverlaySourceProvider {
	sourceType = OpenAerialOverlaySourceType;

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

		return this.http.get<any>(baseUrl, { params: params })
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
		let baseUrl = this.openAerialOverlaysSourceConfig.baseUrl;
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
		const footprint: any = wellknown.parse(openAerialElement.footprint);
		overlay.id = openAerialElement._id;
		overlay.footprint = geojsonPolygonToMultiPolygon(footprint.geometry ? footprint.geometry : footprint);
		overlay.sensorType = openAerialElement.platform;
		overlay.sensorName = openAerialElement.properties.sensor;
		overlay.bestResolution = openAerialElement.gsd;
		overlay.name = openAerialElement.title;
		overlay.imageUrl = openAerialElement.properties.tms;
		overlay.thumbnailUrl = openAerialElement.properties.thumbnail;
		overlay.date = new Date(openAerialElement.acquisition_end);
		overlay.photoTime = openAerialElement.acquisition_end;
		overlay.azimuth = toRadians(180);
		overlay.sourceType = this.sourceType;
		overlay.isGeoRegistered = true;

		return overlay;
	}
}
