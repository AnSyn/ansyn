import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import * as area from '@turf/area';
import * as intersect from '@turf/intersect';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { LimitedArray, mergeLimitedArrays } from '@ansyn/core/utils/limited-array';
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

		const fetchObservables = filters
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

				return this.fetch(newFetchParams).catch(err => {
						console.error(err);
						return Observable.of({
							data: null,
							limited: -1,
							errors: [new Error(`Failed to fetch overlays from ${this.sourceType}`)]
						});
					});
			});

		if (fetchObservables.length <= 0) {
			return Observable.of({data: [], limited: 0, errors: []});
		}

		const multipleFetches: Observable<OverlaysFetchData> = Observable.forkJoin(fetchObservables) // Wait for every fetch to resolve
			.map((data: Array<OverlaysFetchData>) => {
				// All failed
				if (data.reduce((acc, element) => acc + element.errors.length, 0) >= fetchObservables.length) {
					return { data: null, limited: -1, errors: data[0].errors };
				}

				return this.mergeOverlaysFetchData(data, fetchParams.limit)
			});

		return multipleFetches;
	}

	mergeOverlaysFetchData(data: OverlaysFetchData[], limit: number, errors?: Error[]): OverlaysFetchData {
		return {
			...mergeLimitedArrays(data.filter(item => !this.isFaulty(item)) as Array<LimitedArray>,
				limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}),
			errors: errors ? errors : this.mergeErrors(data)
		};
	}

	mergeErrors(data: OverlaysFetchData[]): Error[] {
		return [].concat.apply([],
				data.map(overlayFetchData => Array.isArray(overlayFetchData.errors) ? overlayFetchData.errors : []));
	}

	isFaulty(data: OverlaysFetchData): boolean {
		return !(Array.isArray(data.data) && data.limited >= 0);
	}

	abstract fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData>;

	abstract getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<StartAndEndDate>;

	abstract getById(id: string, sourceType: string): Observable<Overlay>;

	abstract getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any>;
}
