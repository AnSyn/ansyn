import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { mergeLimitedArrays } from '@ansyn/core/utils/limited-array';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';

export interface DateRange {
	start: Date;
	end: Date;
}

export interface IFetchParams {
	limit: number;
	region: GeoJSON.GeoJsonObject;
	sensors?: string[];
	timeRange: DateRange;
}

export interface OverlayFilter {
	sensor: string;
	coverage: GeoJSON.Feature<any>;
	timeRange: DateRange
}

export interface StartAndEndDate {
	startDate: string,
	endDate: string
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

	fetchMultiple(fetchParams: IFetchParams, filters: OverlayFilter[]): Observable<OverlaysFetchData> {
		const regionFeature: GeoJSON.Feature<any> = {
			type: 'Feature',
			properties: {},
			geometry: fetchParams.region
		};

		// They are strings!
		const fetchParamsTimeRange = {
			start: new Date(fetchParams.timeRange.start),
			end: new Date(fetchParams.timeRange.end)
		};

		const fetchPromises = filters
			.filter(f => { // Make sure they have a common region
				const intersection = intersect(f.coverage, regionFeature);
				if (!intersection || !intersection.geometry) {
					return false;
				}
				return area(intersection) > 0;
			})
			// Make sure they have a common time range
			.filter(f => Boolean(timeIntersection(fetchParamsTimeRange, f.timeRange)))
			.map(f => {
				const region = intersect(f.coverage, regionFeature).geometry;

				// Create new filters, by the common region and time
				let newFetchParams: IFetchParams = {
					limit: fetchParams.limit,
					region: intersect(f.coverage, regionFeature).geometry,
					timeRange: timeIntersection(fetchParamsTimeRange, f.timeRange)
				};

				// Add sensor if exists on the filter
				if (f.sensor) {
					newFetchParams.sensors = [f.sensor];
				}

				return this.fetch(newFetchParams).toPromise();
			});

		const multipleFetches: Promise<OverlaysFetchData> = Promise.all(fetchPromises) // Wait for every fetch to resolve
			.then((data: Array<OverlaysFetchData>) =>
				mergeLimitedArrays(data, fetchParams.limit, {
						sortFn: sortByDateDesc,
						uniqueBy: o => o.id
					})); // merge overlays from multiple requests

		return Observable.from(multipleFetches);
	}

	abstract fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData>;

	abstract getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<StartAndEndDate>;

	abstract getById(id: string, sourceType: string): Observable<Overlay>;

	abstract getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any>;
}
