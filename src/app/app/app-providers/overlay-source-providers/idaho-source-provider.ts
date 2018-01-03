import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import * as wellknown from 'wellknown';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geojsonMultiPolygonToPolygon } from '@ansyn/core/utils/geo';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { toRadians } from '@ansyn/core/utils/math';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { limitArray } from '@ansyn/core/utils/limited-array';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';

const DEFAULT_OVERLAYS_LIMIT = 500;
export const IdahoOverlaySourceType = 'IDAHO';

export const IdahoOverlaysSourceConfig: InjectionToken<IIdahoOverlaySourceConfig> = new InjectionToken('idaho-overlays-source-config');

interface IdahoResponse {
	idahoResult: Array<any>;
	token: string;
}

interface IdahoResponseForGetById {
	idahoResult: any;
	token: string;
}

export interface IIdahoOverlaySourceConfig {
	baseUrl: string;
	defaultApi: string;
	overlaysByTimeAndPolygon: string;
}

@Injectable()
export class IdahoSourceProvider extends BaseOverlaySourceProvider {
	sourceType = IdahoOverlaySourceType;

	constructor(protected http: HttpClient, @Inject(IdahoOverlaysSourceConfig) protected _overlaySourceConfig: IIdahoOverlaySourceConfig) {
		super();
	}

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.defaultApi) + '/' + id;
		return <Observable<Overlay>>this.http.get(url)
			.map(this.extractData.bind(this))
			.catch(this.handleError);
	};

	public fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData> {
		// Multiple Source Provider may send a MultiPolygon which Idaho can't handle
		if (fetchParams.region.type === 'MultiPolygon') {
			fetchParams.region = geojsonMultiPolygonToPolygon(fetchParams.region as GeoJSON.MultiPolygon);
		}

		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.overlaysByTimeAndPolygon);

		// if limit not provided by config - set default value
		fetchParams.limit = fetchParams.limit ? fetchParams.limit : DEFAULT_OVERLAYS_LIMIT;
		// add 1 to limit - so we'll know if provider have more then X overlays
		const requestParams  = Object.assign({}, fetchParams, {limit: fetchParams.limit + 1});

		return <Observable<OverlaysFetchData>>this.http.post(url, requestParams)
			.map(this.extractArrayData.bind(this))
			.map((overlays: Overlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
			.catch(this.handleError);

	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<StartAndEndDate> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDate');
		return <Observable<StartAndEndDate>>this.http.post<StartAndEndDate>(url, params)
			.catch(this.handleError);
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<StartAndEndDate> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDateRange');
		return <Observable<StartAndEndDate>>this.http.post<StartAndEndDate>(url, params)
			.catch(this.handleError);
	}

	private extractArrayData(data: IdahoResponse): Array<Overlay> {
		return data ? data.idahoResult.map((element) => {
			return this.parseData(element, data.token);
		}) : [];
	}

	private extractData(data: IdahoResponseForGetById): Overlay {
		return this.parseData(data.idahoResult, data.token);
	}

	private handleError(error: Response | any): any {
		let errorMessage: string;
		if (error instanceof Response) {
			const body = error.json() || '';
			const bodyError = body.error || JSON.stringify(body);
			errorMessage = `${bodyError.status} - ${bodyError.statusText || ''} ${bodyError}`;
		} else {
			errorMessage = error.message ? error.message : error.toString();
		}
		console.warn(errorMessage);
		return Observable.empty();
	}

	protected parseData(idahoElement: any, token: string): Overlay {
		let overlay: Overlay = new Overlay();
		const footprint: any = wellknown.parse(idahoElement.properties.footprintWkt);
		overlay.id = idahoElement.identifier;
		overlay.footprint = footprint.geometry ? footprint.geometry : footprint;
		let bands = '0';
		if (idahoElement.properties.numBands > 1 && idahoElement.properties.numBands < 5) {
			bands = '2,1,0';
		} else if (idahoElement.properties.numBands >= 5) {
			bands = '4,2,1';
		}
		overlay.sensorType = idahoElement.properties.sensorName;
		overlay.sensorName = idahoElement.properties.platformName;
		overlay.channel = idahoElement.properties.numBands;
		overlay.bestResolution = idahoElement.properties.groundSampleDistanceMeters;
		overlay.name = idahoElement.properties.catalogID;
		overlay.imageUrl = 'http://idaho.geobigdata.io/v1/tile/idaho-images/' + idahoElement.identifier + '/{z}/{x}/{y}?bands=' + bands + '&token=' + token;
		overlay.thumbnailUrl = 'https://geobigdata.io/thumbnails/v1/browse/' + idahoElement.properties.catalogID + '.large.png';
		overlay.date = new Date(idahoElement.properties.acquisitionDate);
		overlay.photoTime = idahoElement.properties.acquisitionDate;
		overlay.azimuth = toRadians(180 - idahoElement.properties.satAzimuth);
		overlay.sourceType = this.sourceType;
		overlay.isFullOverlay = true;
		overlay.isGeoRegistered = true;

		return overlay;
	}
}
