import { forkJoin, Observable, of } from 'rxjs';
import { intersect } from '@turf/turf';
import { Feature, GeoJsonObject } from 'geojson';
import { Injectable } from '@angular/core';
import {
	IDataInputFilterValue,
	ILimitedArray,
	IOverlay,
	IOverlaysFetchData,
	LoggerService,
	mergeLimitedArrays,
	sortByDateDesc
} from '@ansyn/core';

export interface IDateRange {
	start: Date;
	end: Date;
}

export interface IFetchParams {
	limit: number;
	region: GeoJsonObject;
	sensors?: string[];
	dataInputFilters: IDataInputFilterValue[];
	timeRange: IDateRange;
}

export interface IOverlayFilter {
	sensor: string;
	coverage: Feature<any>;
	timeRange: IDateRange
}

export interface IStartAndEndDate {
	startDate: string,
	endDate: string
}

export function timeIntersection(whiteRange: IDateRange, blackRange: IDateRange): IDateRange {
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

export const UNKNOWN_NAME = 'Unknown';

@Injectable()
export abstract class BaseOverlaySourceProvider {
	sourceType: string;

	constructor(protected loggerService: LoggerService) {
	}

	fetchMultiple(fetchParams: IFetchParams, filters: IOverlayFilter[]): Observable<IOverlaysFetchData> {
		const regionFeature: Feature<any> = {
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
				const intersection = intersect(regionFeature, f.coverage);
				return intersection && intersection.geometry;
			})
			// Make sure they have a common time range
			.filter(f => Boolean(timeIntersection(fetchParamsTimeRange, f.timeRange)))
			.map(f => {
				// Create new filters, by the common region and time
				let newFetchParams: IFetchParams = <any> {
					...fetchParams,
					region: intersect(f.coverage, regionFeature).geometry,
					timeRange: timeIntersection(fetchParamsTimeRange, f.timeRange)
				};

				// Add sensor if exists on the filter
				if (f.sensor) {
					newFetchParams.sensors = [f.sensor];
				}

				return this.fetch(newFetchParams).catch(err => {
					this.loggerService.error(err);
					return of({
						data: null,
						limited: -1,
						errors: [new Error(`Failed to fetch overlays from ${this.sourceType}`)]
					});
				});
			});

		if (fetchObservables.length <= 0) {
			return of({ data: [], limited: 0, errors: [] });
		}

		const multipleFetches: Observable<IOverlaysFetchData> = forkJoin(fetchObservables) // Wait for every fetch to resolve
			.map((data: Array<IOverlaysFetchData>) => {
				// All failed
				if (data.reduce((acc, element) => Array.isArray(element.errors) ? acc + element.errors.length : acc, 0) >= fetchObservables.length) {
					return { data: null, limited: -1, errors: data[0].errors };
				}

				return this.mergeOverlaysFetchData(data, fetchParams.limit);
			});

		return multipleFetches;
	}

	mergeOverlaysFetchData(data: IOverlaysFetchData[], limit: number, errors?: Error[]): IOverlaysFetchData {
		return {
			...mergeLimitedArrays(data.filter(item => !this.isFaulty(item)) as Array<ILimitedArray>,
				limit, {
					sortFn: sortByDateDesc,
					uniqueBy: o => o.id
				}),
			errors: errors ? errors : this.mergeErrors(data)
		};
	}

	mergeErrors(data: IOverlaysFetchData[]): Error[] {
		return [].concat.apply([],
			data.map(overlayFetchData => Array.isArray(overlayFetchData.errors) ? overlayFetchData.errors : []));
	}

	isFaulty(data: IOverlaysFetchData): boolean {
		return Array.isArray(data.errors) && data.errors.length > 0;
	}

	abstract fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData>;

	abstract getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<IStartAndEndDate>;

	abstract getById(id: string, sourceType: string): Observable<IOverlay>;

	abstract getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any>;
}
