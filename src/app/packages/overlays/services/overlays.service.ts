import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlayState } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import * as _ from 'lodash';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import * as turf from '@turf/turf';
import { FeatureCollection, GeometryObject, Point } from "@types/geojson";
import { SetTimelineStateAction } from '../actions/overlays.actions';


export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');


@Injectable()
export class OverlaysService {

	constructor(private http: Http, @Inject(OverlaysConfig) private config: IOverlaysConfig) {}

	setSortedDropsMap(dropsData: any[]) {
		return dropsData
			.sort((o1, o2) => {
				if(o2.date < o1.date) return 1;
				if(o1.date < o2.date) return -1;
				return 0;
			})
	}

	getPolygonByPoint(lonLat){
		//cordinates lon,lat
		const point = turf.point(lonLat);
		const radius = this.config.polygonGenerationDisatnce;
		const region = turf.circle(point,radius);
		return region;
	}

	getPointByPolygon(geometry :GeometryObject|FeatureCollection<any>) : Point{
		if(geometry.type === 'FeatureCollection'){
			return <Point>turf.centerOfMass(<FeatureCollection<any>>geometry).geometry;
		}
		else {
			return <Point>turf.centerOfMass(turf.feature(<GeometryObject>geometry)).geometry;
		}
	}

	//@todo move to cases
	getByCase(url = "", params: any = { caseId: ':' }): Observable<any[]> {
		return this.fetch(url || this.config.overlaysByCaseId.replace(':id', params.caseId));
	}

	search(url = "", params: any = {}): Observable<any[]> {
		let bbox = turf.bbox(params.polygon);
		let bboxFeature = turf.bboxPolygon(bbox);
		return this.fetch(url || this.config.overlaysByTimeAndPolygon, {
			region: bboxFeature.geometry,
			timeRange: {
				start: params.from,
				end: params.to
			}
		});
	}

	fetch(url, params = undefined) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers });
		url = this.config.baseUrl.concat(url);
		if (params) {
			return this.http.post(url, params, options).map(this.extractData).catch(this.handleError);
		}
		return this.http.get(url, options).map(this.extractData).catch(this.handleError);
	}

	parseOverlayDataForDispaly(overlays = [], filters: { filteringParams: any, filterFunc: (ovrelay: any, filteringParams: any) => boolean }[]): Array<any> {
		let result = new Array();
		let overlaysData = new Array();

		if (!filters || !Array.isArray(filters)) {
			overlays.forEach(overlay => overlaysData.push({ id: overlay.id, date: overlay.date }));
		} else {
			overlays.forEach(overlay => {
				if (filters.every(filter => filter.filterFunc(overlay, filter.filteringParams))) {
					overlaysData.push({ id: overlay.id, date: overlay.date });
				}
			});
		}

		overlaysData = this.setSortedDropsMap(overlaysData);

		result.push({ name: undefined, data: overlaysData });

		return result;
	}

	extractData(response: Response) {
		const data = response.json();
		return data || [];
	}

	compareOverlays(data: IOverlayState, data1: IOverlayState) {
		const result = _.isEqual(data.overlays, data1.overlays) && _.isEqual(data.filters, data1.filters) && _.isEqual(data.timelineState, data1.timelineState) ;
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

	getTimeStateByOverlay(displayedOverlay: Overlay, timelineState: {from: Date, to: Date}): {from: Date, to: Date} {
		const delta: number = timelineState.to.getTime() - timelineState.from.getTime();
		const deltaTenth: number = (delta) * 0.1;
		let from: Date, to: Date;
		if(displayedOverlay.date < timelineState.from){
			from = new Date(displayedOverlay.date.getTime() - deltaTenth);
			to = new Date(from.getTime() + delta);
		} else if(timelineState.to < displayedOverlay.date) {
			to = new Date(displayedOverlay.date.getTime() + deltaTenth);
			from = new Date(to.getTime() - delta);
		}
		return {from, to}
	}

}
