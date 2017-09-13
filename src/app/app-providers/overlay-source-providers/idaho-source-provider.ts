import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import * as wellknown from 'wellknown';
import { Inject, Injectable, InjectionToken } from '@angular/core';

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
	overlaysByTimeAndPolygon: string;
	defaultApi: string;
}

@Injectable()
export class IdahoSourceProvider extends BaseOverlaySourceProvider {
	constructor(private http: Http, @Inject(IdahoOverlaysSourceConfig) private _overlaySourceConfig: IIdahoOverlaySourceConfig) {
		super();
		this.sourceType = IdahoOverlaySourceType;
	}

	public getById(id: string): Observable<Overlay> {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers });
		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.defaultApi) + '/' + id;
		return <Observable<Overlay>>this.http.get(url, options)
			.map(this.extractData.bind(this))
			.catch(this.handleError);
	};

	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers });
		let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.overlaysByTimeAndPolygon);
		return <Observable<Overlay[]>>this.http.post(url, fetchParams, options)
			.map(this.extractArrayData.bind(this))
			.catch(this.handleError);

	}

	public getStartDateViaLimitFasets(params: { facets, limit, region }): Observable<Array<Overlay>> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDate');
		return this.http.post(url, params)
			.map(res => res.json())
			.catch(this.handleError);
	}

	private extractArrayData(response: Response): Array<Overlay> {
		const data: IdahoResponse = response.json();
		return data ? data.idahoResult.map((element) => {
			return this.parseData(element, data.token);
		}) : [];
	}

	private extractData(response: Response): Overlay {
		const data: IdahoResponseForGetById = response.json();
		return this.parseData(data.idahoResult, data.token);
	}

	private handleError(error: Response | any): any {
		let errorMessage: string;
		const _error = error;
		if (error instanceof Response) {
			const body = _error.json() || '';
			const bodyError = body.error || JSON.stringify(body);
			errorMessage = `${bodyError.status} - ${bodyError.statusText || ''} ${bodyError}`;
		} else {
			errorMessage = error.message ? error.message : error.toString();
		}
		console.warn(errorMessage);
		return Observable.empty();
	}

	private parseData(idahoElement: any, token: string): Overlay {

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
		overlay.sensorType = idahoElement.properties.platformName;
		overlay.sensorName = idahoElement.properties.sensorName;
		overlay.channel = idahoElement.properties.numBands;
		overlay.bestResolution = idahoElement.properties.groundSampleDistanceMeters;
		overlay.name = idahoElement.properties.catalogID;
		overlay.imageUrl = 'http://idaho.geobigdata.io/v1/tile/idaho-images/' + idahoElement.identifier + '/{z}/{x}/{y}?bands=' + bands + '&token=' + token;
		overlay.thumbnailUrl = 'https://geobigdata.io/thumbnails/v1/browse/' + idahoElement.properties.catalogID + '.large.png';
		overlay.date = new Date(idahoElement.properties.acquisitionDate);
		overlay.photoTime = idahoElement.properties.acquisitionDate;
		overlay.azimuth = 0;
		overlay.sourceType = IdahoOverlaySourceType;
		overlay.isFullOverlay = true;
		overlay.isGeoRegistered = true;

		return overlay;
	}
}
