import { BaseOverlaySourceProvider, IFetchParams } from 'app/@ansyn/overlays/index';
import { Observable } from 'rxjs/Observable';
import { OpenAerialOverlay, OverlaysOpenAerialFetchData } from '@ansyn/core/models/overlay.model';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { ErrorHandlerService, Overlay } from 'app/@ansyn/core/index';
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { sortByDateDesc } from "@ansyn/core/utils/sorting";
import { bboxFromGeoJson, geojsonMultiPolygonToPolygon, geojsonPolygonToMultiPolygon } from "@ansyn/core/utils/geo";
import { limitArray } from "@ansyn/core/utils/limited-array";
import { Response } from "@angular/http";
import { toRadians } from "@ansyn/core/utils/math";
import * as wellknown from "wellknown";

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
				protected http: HttpClient,
				@Inject(OpenAerialOverlaysSourceConfig)
				protected openAerialOverlaysSourceConfig: IOpenAerialOverlaySourceConfig) {
		super();

	}

	fetch(fetchParams: IFetchParams): Observable<OverlaysOpenAerialFetchData> {
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}
		let bbox = bboxFromGeoJson(fetchParams.region as GeoJSON.Polygon);
		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		let baseUrl = this.openAerialOverlaysSourceConfig.baseUrl;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const params = {
			limit: `${fetchParams.limit + 1}`,
			bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
			acquisition_from: fetchParams.timeRange.start.toISOString(),
			acquisition_to: fetchParams.timeRange.end.toISOString()
		};

		return this.http.get<OverlaysOpenAerialFetchData>(baseUrl, { params: params })
			.map(data => {
				return this.extractArrayData(data.results);
			})
			.map((overlays: Overlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
			.catch((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	getById(id: string, sourceType: string): Observable<Overlay> {
		let baseUrl = this.openAerialOverlaysSourceConfig.baseUrl;
		return this.http.get<OverlaysOpenAerialFetchData>(baseUrl, { params: { _id: id } })
			.map(data => {
				return this.extractData(data.results);
			})
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

	private extractArrayData(overlays: Array<any>): Array<Overlay> {
		if (!overlays) {
			return [];
		}

		return overlays.filter(meta => meta.properties && meta.properties.tms)
			.map((element) => this.parseData(element));
	}

	private extractData(overlays: Array<any>): Overlay {
		if (overlays.length > 0) {
			return this.parseData(overlays[0]);
		}
	}

	protected parseData(openAerialElement: OpenAerialOverlay): Overlay {
		let overlay: Overlay = new Overlay();
		const footprint: any = wellknown.parse(openAerialElement.footprint);
		overlay.id = openAerialElement._id;
		overlay.footprint = geojsonPolygonToMultiPolygon(footprint.geometry ? footprint.geometry : footprint);
		overlay.sensorType = openAerialElement.properties.sensor;
		overlay.sensorName = openAerialElement.platform;
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
