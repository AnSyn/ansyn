import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { ErrorHandlerService, Overlay } from '@ansyn/core';
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { sortByDateDesc } from "@ansyn/core/utils/sorting";
import { geojsonMultiPolygonToPolygon } from "@ansyn/core/utils/geo";
import { limitArray } from "@ansyn/core/utils/limited-array";
import { Response } from "@angular/http";
import * as wellknown from "wellknown";
import { toRadians } from "@ansyn/core/utils/math";

const DEFAULT_OVERLAYS_LIMIT = 500;
export const OpenAerialOverlaySourceType = 'OPEN_AERIAL';

export const OpenAerialOverlaysSourceConfig: InjectionToken<IOpenAerialOverlaySourceConfig> = new InjectionToken('open-aerial-overlays-source-config');

interface OpenAerialResponse {
	openAerialResult: Array<any>;
	token: string;
}

interface OpenAerialResponseForGetById {
	openAerialResult: any;
	token: string;
}

export interface IOpenAerialOverlaySourceConfig {
	baseUrl: string;
	defaultApi: string;
	overlaysByTimeAndPolygon: string;
}

@Injectable()
export class OpenAerialSourceProvider extends BaseOverlaySourceProvider {
	sourceType = OpenAerialOverlaySourceType;

	constructor(public errorHandlerService: ErrorHandlerService, protected http: HttpClient, @Inject(OpenAerialOverlaysSourceConfig) protected _overlaySourceConfig: IOpenAerialOverlaySourceConfig) {
		super();

	}

	fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData> {
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}

		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.overlaysByTimeAndPolygon);

		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const requestParams = Object.assign({}, fetchParams, { limit: fetchParams.limit + 1 });
		return <Observable<OverlaysFetchData>>this.http.post(url, requestParams)
			.map(this.extractArrayData.bind(this))
			.map((overlays: Overlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
			.catch((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			});
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<StartAndEndDate> {
		return undefined;
	}

	getById(id: string, sourceType: string): Observable<Overlay> {
		return undefined;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return undefined;
	}

	private extractArrayData(data: OpenAerialResponse): Array<Overlay> {
		return data ? data.openAerialResult.map((element) => {
			return this.parseData(element, data.token);
		}) : [];
	}

	private extractData(data: OpenAerialResponseForGetById): Overlay {
		return this.parseData(data.openAerialResult, data.token);
	}

	protected parseData(openAerialElement: any, token: string): Overlay {
		let overlay: Overlay = new Overlay();
		const footprint: any = wellknown.parse(openAerialElement.properties.footprintWkt);
		overlay.id = openAerialElement.identifier;
		overlay.footprint = footprint.geometry ? footprint.geometry : footprint;
		let bands = '0';
		if (openAerialElement.properties.numBands > 1 && openAerialElement.properties.numBands < 5) {
			bands = '2,1,0';
		} else if (openAerialElement.properties.numBands >= 5) {
			bands = '4,2,1';
		}
		overlay.sensorType = openAerialElement.properties.sensor;
		overlay.sensorName = openAerialElement.platform;
		overlay.channel = openAerialElement.properties.numBands;
		overlay.bestResolution = openAerialElement.properties.groundSampleDistanceMeters;
		overlay.name = openAerialElement.properties.catalogID;
		overlay.imageUrl = openAerialElement.properties.tms ? openAerialElement.properties.tms : openAerialElement.properties.wmts; // sometimes gets a different projection
		overlay.thumbnailUrl = openAerialElement.properties.thumbnail;
		overlay.date = new Date(openAerialElement.properties.acquisitionDate);
		overlay.photoTime = openAerialElement.properties.acquisitionDate;
		overlay.azimuth = toRadians(180 - openAerialElement.properties.satAzimuth);
		overlay.sourceType = this.sourceType;
		overlay.isFullOverlay = true;
		overlay.isGeoRegistered = true;

		return overlay;
	}
}
