import {BaseOverlaySourceProvider} from '../models/base-overlay-source-provider.model';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlayState } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import { isEqual } from 'lodash';
import { getPointByPolygon, getPolygonByPoint } from '@ansyn/core/utils';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


import { point, feature } from '@turf/helpers';
import * as centerOfMass from '@turf/center-of-mass';
import * as circle from '@turf/circle';
import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';

import { FeatureCollection, GeometryObject, Point } from "geojson";



export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

@Injectable()
export class OverlaysService {

	constructor(private http: Http, @Inject(OverlaysConfig) private config: IOverlaysConfig , private _overlaySourceProvider: BaseOverlaySourceProvider) {}

	setSortedDropsMap(dropsData: any[]) {
		return dropsData
			.sort((o1, o2) => {
				if(o2.date < o1.date) return 1;
				if(o1.date < o2.date) return -1;
				return 0;
			});
	}

	search(params: any = {}): Observable<Array<Overlay>> {
		let tBbox = bbox(params.polygon);
		let tBboxFeature = bboxPolygon(tBbox);
		return this._overlaySourceProvider.fetch({
			region: tBboxFeature.geometry,
			timeRange: {
				start: params.from,
				end: params.to
			}
		});
	}

	getStartDateViaLimitFasets(params: {facets, limit, region}): Observable<any> {
		return this._overlaySourceProvider.getStartDateViaLimitFasets(params);
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

	compareOverlays(data: IOverlayState, data1: IOverlayState) {
		const result =   isEqual(data.overlays, data1.overlays) &&   isEqual(data.filters, data1.filters) &&   isEqual(data.timelineState, data1.timelineState) ;
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
		return {from, to};
	}

	extractData(response: Response) {
		const data = response.json();
		return data || [];
	}

}
