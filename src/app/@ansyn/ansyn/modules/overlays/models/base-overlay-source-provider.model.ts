import { forkJoin, Observable, of } from 'rxjs';
import { feature, intersect } from '@turf/turf';
import { Feature, GeoJsonObject } from 'geojson';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { IOverlayByIdMetaData } from '../services/overlays.service';
import { ILimitedArray, mergeLimitedArrays } from '../../core/utils/i-limited-array';
import { forkJoinSafe } from '../../core/utils/rxjs/observables/fork-join-safe';
import { sortByDateDesc } from '../../core/utils/sorting';
import { IDateRange } from '../../core/models/multiple-overlays-source-config';
import { LoggerService } from '../../core/services/logger.service';
import { IOverlay, IOverlayError, IOverlaysFetchData, IResolutionRange } from './overlay.model';
import { IDataInputFilterValue } from '../../menu-items/cases/models/case.model';
import { getErrorLogFromException } from '../../core/utils/logs/timer-logs';

export interface IFetchParams {
	limit: number;
	region: GeoJsonObject;
	sensors?: string[];
	dataInputFilters: IDataInputFilterValue[];
	timeRange: IDateRange;
	customSensorToFilter: string[]; // for context
	resolution?: IResolutionRange;
	types?: string[];
	registeration?: string[];
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

export function mergeErrors(data: IOverlaysFetchData[]): IOverlayError[] {
	return [].concat.apply([],
		data.map(overlayFetchData => Array.isArray(overlayFetchData.errors) ? overlayFetchData.errors : []));
}

export function mergeOverlaysFetchData(data: IOverlaysFetchData[], limit: number, errors?: IOverlayError[]): IOverlaysFetchData {
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

	buildFetchObservables(fetchParams: IFetchParams, filters: IOverlayFilter[]): Observable<IOverlaysFetchData>[] {
		const regionFeature: Feature<any> = feature(<any>fetchParams.region);
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
				let newFetchParams: IFetchParams = <any>{
					...fetchParams,
					region: intersect(f.coverage, regionFeature).geometry,
					timeRange: timeIntersection(fetchParamsTimeRange, f.timeRange)
				};

				// Add sensor if exists on the filter
				if (f.sensor) {
					newFetchParams.sensors = [f.sensor];
				}

				return this.fetch(newFetchParams).pipe(catchError((err: Error | string) => {
					const errMsg = getErrorLogFromException(err, `Failed to fetch overlay's newFetchParams=${JSON.stringify(newFetchParams)}`);
					this.loggerService.error(errMsg, 'overlays');
					return of({
						data: null,
						limited: -1,
						errors: [{
							message: err.toString(),
							sourceType: this.sourceType
						}]
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

	abstract getById(id: string, sourceType: string): Observable<IOverlay>;

	getByIds(ids: IOverlayByIdMetaData[]): Observable<IOverlay[]> {
		const requests = ids.map(({ id, sourceType }) => this.getById(id, sourceType));
		return forkJoinSafe(requests);
	};

	getThumbnailUrl(overlay, position): Observable<string> {
		if (!overlay.thumbnailUrl) {
			overlay.thumbnailUrl = overlay.imageUrl;
		}
		return of(overlay.thumbnailUrl);
	}

	getThumbnailName(overlay): string {
		return overlay.sensorName;
	}
}
