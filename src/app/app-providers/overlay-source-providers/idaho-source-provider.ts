import {BaseOverlaySourceProvider,IFetchParams} from '@ansyn/overlays'
import { Overlay } from '@ansyn/core'
import { Observable } from "rxjs/Observable";
import { RequestOptions ,Headers ,Http,Response} from "@angular/http";
import * as wellknown from 'wellknown';
import { InjectionToken,Inject,Injectable } from "@angular/core";

export const IdahoOverlaySourceType = "IDAHO";

export const IdahoOverlaysSourceConfig: InjectionToken<IIdahoOverlaySourceConfig> = new InjectionToken('idaho-overlays-source-config');

interface IdahoResponse {
    idahoResult : Array<any>,
    token : string
}

export interface IIdahoOverlaySourceConfig {
    baseUrl :string;
    overlaysByTimeAndPolygon : string;
}

@Injectable()
export class IdahoSourceProvider extends BaseOverlaySourceProvider {
    constructor(private http: Http ,@Inject(IdahoOverlaysSourceConfig) private _overlaySourceConfig: IIdahoOverlaySourceConfig){
        super();
        this.sourceType = IdahoOverlaySourceType;
    }

    public fetch(fetchParams : IFetchParams) : Observable<Array<Overlay>> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers });
        let url = this._overlaySourceConfig.baseUrl.concat(this._overlaySourceConfig.overlaysByTimeAndPolygon);
        return this.http.post(url, fetchParams, options)
						.map(this.extractData.bind(this))
						.catch(this.handleError);

    }
	public getStartDateViaLimitFasets(params: {facets, limit, region}): Observable<Array<Overlay>> {
		const url = this._overlaySourceConfig.baseUrl.concat('overlays/findDate');
		return this.http.post(url, params)
			.map(res => res.json())
			.catch(this.handleError);
    }

    private extractData(response: Response) : Array<Overlay>{
        const data : IdahoResponse = response.json();
		return data ?  data.idahoResult.map((element) => {
            return this.parseData(element,data.token);
        }) : [];
    }

    private handleError(error: Response | any): any {
		let errorMessage: string;
		const _error = error;
		if (error instanceof Response) {
			const body = _error.json() || '';
			const error = body.error || JSON.stringify(body);
			errorMessage = `${error.status} - ${error.statusText || ''} ${error}`;
		} else {
			errorMessage = error.message ? error.message : error.toString();
		}
		console.warn(errorMessage);
		return Observable.empty();
    }

    private  parseData(idahoElement: any , token:string): Overlay {
        let overlay: Overlay = (new Object()) as Overlay;
        const footprint: any =wellknown.parse(idahoElement.properties.footprintWkt);

        overlay.id = idahoElement.identifier;
        overlay.footprint = footprint.geometry ? footprint.geometry : footprint;
        overlay.sensorType = idahoElement.properties.platformName;
        overlay.sensorName = idahoElement.properties.sensorName;
        overlay.channel = idahoElement.properties.numBands;
        overlay.bestResolution = idahoElement.properties.groundSampleDistanceMeters;
        overlay.name = idahoElement.properties.catalogID;
        overlay.imageUrl = "http://idaho.geobigdata.io/v1/tile/idaho-images/" + idahoElement.identifier + '/{z}/{x}/{y}?bands=0&token=' + token;
        overlay.thumbnailUrl = "https://geobigdata.io/thumbnails/v1/browse/" + idahoElement.properties.catalogID + ".large.png";
        overlay.date = new Date(idahoElement.properties.acquisitionDate);
        overlay.photoTime =  idahoElement.properties.acquisitionDate;
        overlay.azimuth = 0;
        overlay.sourceType = IdahoOverlaySourceType;

        return overlay;

    }
}
