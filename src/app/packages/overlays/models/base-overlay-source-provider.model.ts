import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';
import { Feature } from 'geojson';

interface DateRange {
	start: Date;
	end: Date;
}

export interface IFetchParams {
	region: GeoJSON.DirectGeometryObject;
	sensors?: string[];
	timeRange: DateRange;
}

export interface OverlayFilter {
	sensor: string;
	coverage: GeoJSON.Feature<any>;
	timeRange: DateRange
}

export function timeIntersection(whiteRange: DateRange, blackRange: DateRange): DateRange {
	if (!blackRange.end || (whiteRange.end && whiteRange.end <= blackRange.end)) {
		if (!blackRange.start || whiteRange.end > blackRange.start) {
			if (whiteRange.start >= blackRange.start) {
				return whiteRange;
			} else {
				return { start: blackRange.start, end: whiteRange.end };
			}
		}
	} else if (!whiteRange.start || blackRange.end >= whiteRange.start) {
		if (whiteRange.start <= blackRange.start) {
			return blackRange;
		} else {
			return { start: whiteRange.start, end: blackRange.end };
		}
	}

	return null;
}

export abstract class BaseOverlaySourceProvider {
	sourceType: string;

	fetchMultiple(fetchParams: IFetchParams, filters: OverlayFilter[]): Observable<Overlay[]> {
		const regionFeature: GeoJSON.Feature<any> = {
			type: 'Feature',
			properties: {},
			geometry: fetchParams.region
		};

		// They are strings!
		const fetchParamsTimeRange = {
			start: new Date(fetchParams.timeRange.start),
			end: new Date(fetchParams.timeRange.end),
		};

		const fetchPromises = filters
			.filter(f => {
				const intersection = intersect(f.coverage, regionFeature);
				if (!intersection) {
					return false;
				}
				return area(intersection) > 0;
			})
			.filter(f => Boolean(timeIntersection(fetchParamsTimeRange, f.timeRange)))
			.map(f => {
				const region = intersect(f.coverage, regionFeature).geometry;

				let newFetchParams: IFetchParams = {
					region,
					timeRange: fetchParams.timeRange
				};

				if (f.sensor) {
					newFetchParams.sensors = [f.sensor];
				}

				return this.fetch(newFetchParams).toPromise();
			});

		const multipleFetches = Promise.all(fetchPromises)
			.then(overlaysArr => overlaysArr.reduce((a, b) => a.concat(b), []))
			.then(overlays => overlays.sort((o1, o2) => o1.date > o2.date ? -1 : 1));

		return Observable.from(multipleFetches);
	}

	abstract fetch(fetchParams: IFetchParams): Observable<Overlay[]>;

	abstract getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any>;

	abstract getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any>;

	abstract getById(id: string): Observable<Overlay>;
}
