import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IOverlayState } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import * as _ from 'lodash';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

export const  OverlaysConfig: InjectionToken <IOverlaysConfig> = new InjectionToken('overlays-config');


@Injectable()
export class OverlaysService {
    //private dataUrl = "//localhost:8037/api/mock/eventDrops/data";
    private dataUrl: string;
    private polygonTimeSearchUrl: string;

    constructor(private http: Http, @Inject(OverlaysConfig) private config: IOverlaysConfig) {
        this.dataUrl = this.config.baseUrl + this.config.overlaysByCaseId;
        this.polygonTimeSearchUrl = this.config.baseUrl +  this.config.overlaysByTimeAndPolygon;
    }

    //@todo add support for parsing callback function
    fetchData(url = "", params: any = {}): Observable < any[] > {
        let restPath = url;

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        if (!restPath) {
            restPath = this.dataUrl.replace(':id', params.caseId);
        }

        //const data = JSON.stringify(params);
        return this.http.get(restPath, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    searchOverlay(url = "", params: any = {}): Observable < any[] >{
        let restPath = url;

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        if (!restPath) {
            restPath = this.polygonTimeSearchUrl;
        }

        const qData = {
            region : params.polygon,
            timeRange :{
                start: params.from,
                end: params.to
            }
        } 
        return this.http.post(restPath,qData, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    parseOverlayDataForDispaly(overlays = [], filters = {}): Array < any > {
        let result = new Array();
        let overlaysData = new Array();
        if (!Object.keys(filters).length) {

            //convert the "hash table" to array of objects (very bed performence must think on another way of doing that)
            //maybe I will do it inside the event drops component itself
            //so the component will be able to get 2 types Array and Map

            overlays.forEach(value => overlaysData.push({ id: value.id, date: value.date }));

            result.push({
                name: undefined,
                data: overlaysData
            });
        }
        return result;
    }



    extractData(response: Response) {
        const data = response.json();
        return data || [];
    }

    compareOverlays(data: IOverlayState, data1: IOverlayState) {
        const result = _.isEqual(data.overlays, data1.overlays);
        return result;
    }

    handleError(error: Response | any): any {
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
}
