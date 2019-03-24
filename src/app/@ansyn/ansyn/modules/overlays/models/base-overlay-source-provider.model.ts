import { forkJoin, Observable, of } from 'rxjs';
import { feature, intersect } from '@turf/turf';
import { Feature, GeoJsonObject } from 'geojson';
import { Injectable } from '@angular/core';
import {
	forkJoinSafe,
	IDataInputFilterValue, IDateRange,
	ILimitedArray,
	IOverlay,
	IOverlaysFetchData,
	LoggerService,
	mergeLimitedArrays,
	sortByDateDesc
} from '../../core/public_api';
import { catchError, map } from 'rxjs/operators';
import { IOverlayByIdMetaData } from '../services/overlays.service';

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
export function isFaulty(data: IOverlaysFetchData): boolean {
	return Array.isArray(data.errors) && data.errors.length > 0;
}

export function mergeErrors(data: IOverlaysFetchData[]): Error[] {
	return [].concat.apply([],
		data.map(overlayFetchData => Array.isArray(overlayFetchData.errors) ? overlayFetchData.errors : []));
}

export function mergeOverlaysFetchData(data: IOverlaysFetchData[], limit: number, errors?: Error[]): IOverlaysFetchData {
	return {
		...mergeLimitedArrays(data.filter(item => !isFaulty(item)) as Array<ILimitedArray>,
			limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}),
		errors: errors ? errors : mergeErrors(data)
	};
}

@Injectable()
export abstract class BaseOverlaySourceProvider {
	readonly sourceType: string;

	constructor(protected loggerService: LoggerService) {
	}

	buildFetchObservables(fetchParams: IFetchParams, filters: IOverlayFilter[]): Observable<any>[] {
		const regionFeature: Feature<any> = feature(<any> fetchParams.region);
		// They are strings!
		const fetchParamsTimeRange = {
			start: new Date(fetchParams.timeRange.start),
			end: new Date(fetchParams.timeRange.end)
		};

		return filters
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

				return this.fetch(newFetchParams).pipe(catchError(err => {
					this.loggerService.error(err);
					return of({
						data: null,
						limited: -1,
						errors: [new Error(`Failed to fetch overlays from ${this.sourceType}`)]
					});
				}));
			})
	}

	fetchMultiple(fetchParams: IFetchParams, filters: IOverlayFilter[]): Observable<IOverlaysFetchData> {
		const fetchObservables = this.buildFetchObservables(fetchParams, filters);
		if (fetchObservables.length <= 0) {
			return of({ data: [], limited: 0, errors: [] });
		}

		const multipleFetches: Observable<IOverlaysFetchData> = forkJoin(fetchObservables).pipe( // Wait for every fetch to resolve
			map((data: Array<IOverlaysFetchData>) => {
				// All failed
				if (data.reduce((acc, element) => Array.isArray(element.errors) ? acc + element.errors.length : acc, 0) >= fetchObservables.length) {
					return { data: null, limited: -1, errors: data[0].errors };
				}

				return mergeOverlaysFetchData(data, fetchParams.limit);
			})
		);

		return multipleFetches;
	}

	abstract fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData>;

	abstract getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<IStartAndEndDate>;

	abstract getById(id: string, sourceType: string): Observable<IOverlay>;

	abstract getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any>;

	getByIds(ids: IOverlayByIdMetaData[]): Observable<IOverlay[]> {
		const requests = ids.map(({ id, sourceType }) => this.getById(id, sourceType));
		return forkJoinSafe(requests);
	};
}
