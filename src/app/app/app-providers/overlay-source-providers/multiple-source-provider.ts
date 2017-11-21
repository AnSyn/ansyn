import { BaseOverlaySourceProvider, DateRange, IFetchParams } from '@ansyn/overlays';
import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import * as intersect from '@turf/intersect';
import * as area from '@turf/area';
import * as difference from '@turf/difference';
import { OverlayFilter } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { StartAndEndDate } from '@ansyn/overlays/models/base-overlay-source-provider.model';

interface FiltersList {
	name: string,
	dates: DateRange[]
	sensorNames: string[],
	coverage: number[][][][]
}

interface IMultipleOverlaysSourceConfig {
	[key: string]: {
		whitelist: FiltersList[],
		blacklist: FiltersList[]
	}
}

type IMultipleOverlaysSources = BaseOverlaySourceProvider;

export const MultipleOverlaysSourceConfig: InjectionToken<IMultipleOverlaysSourceConfig> = new InjectionToken('multiple-overlays-source-config');
export const MultipleOverlaysSource: InjectionToken<IMultipleOverlaysSources> = new InjectionToken('multiple-overlays-sources');

@Injectable()
export class MultipleOverlaysSourceProvider extends BaseOverlaySourceProvider {

	private sourceConfigs: Array<{ filters: OverlayFilter[], provider: BaseOverlaySourceProvider }> = [];

	constructor(@Inject(MultipleOverlaysSourceConfig) private multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				@Inject(MultipleOverlaysSource) private overlaysSources: IMultipleOverlaysSources[]) {
		super();

		this.prepareWhitelist();
	}

	private coverageToFeature(coordinates: number[][][]): GeoJSON.Feature<GeoJSON.Polygon> {
		return {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'Polygon',
				coordinates
			}
		};
	}

	private prepareWhitelist() {
		this.overlaysSources.forEach(provider => {
			const type = provider.sourceType;

			const config = this.multipleOverlaysSourceConfig[type];

			if (!config || !config.whitelist) {
				throw new Error('Missing config for provider ' + type);
			}

			let whiteFilters = [];

			// Separate all sensors, date ranges, and polygons
			config.whitelist.forEach(filter => {
				filter.sensorNames.forEach(sensor => {
					filter.coverage.forEach(polygon => {
						filter.dates.forEach(date => {
							const dateObj = {
								start: date.start ? new Date(date.start) : null,
								end: date.end ? new Date(date.end) : null,
							};
							whiteFilters.push({
								sensor,
								timeRange: dateObj,
								coverage: this.coverageToFeature(polygon)
							});
						});
					});
				});
			});

			if (config.blacklist) {
				let blackFilters = [];

				// Separate all sensors, date ranges, and polygons
				config.blacklist.forEach(filter => {
					filter.sensorNames.forEach(sensor => {
						filter.coverage.forEach(polygon => {
							filter.dates.forEach(date => {
								const dateObj = {
									start: date.start ? new Date(date.start) : null,
									end: date.end ? new Date(date.end) : null,
								};
								blackFilters.push({
									sensor,
									timeRange: dateObj,
									coverage: this.coverageToFeature(polygon)
								});
							});
						});
					});
				});

				// Sort blackFilters by date (creates less work for the filter
				blackFilters = blackFilters.sort((a, b) => (!a.timeRange.start || a.timeRange.start > b.timeRange.start) ? 1 : -1);

				// Remove filters that are blacklisted
				whiteFilters = whiteFilters
					.map(filter => filterFilter(filter, blackFilters))
					.reduce((a, b) => a.concat(b), []);
			}

			// If there are whiteFilters after removing the blackFilters, add it to the sourceConfigs list
			if (whiteFilters.length > 0) {
				this.sourceConfigs.push({
					provider,
					filters: whiteFilters
				});
			}
		});
	}

	public getById(id: string, sourceType: string): Observable<Overlay> {
		return this.overlaysSources.find(s => s.sourceType === sourceType).getById(id, sourceType);
	}

	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		const mergedSortedOverlays = Promise.all(this.sourceConfigs
			.map(s => s.provider.fetchMultiple(fetchParams, s.filters).toPromise()))
			.then(overlaysArr => overlaysArr.reduce((a, b) => a.concat(b), []))
			.then(overlays => overlays.sort((o1, o2) => o1.date > o2.date ? -1 : 1));

		return Observable.from(mergedSortedOverlays);
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<StartAndEndDate> {
		const startEnd = Promise.all(this.sourceConfigs
			.map(s => s.provider.getStartDateViaLimitFacets(params).toPromise()))
			.then(dates => dates.map(d =>
				({ startDate: new Date(d.startDate), endDate: new Date(d.endDate) })))
			.then(dates => dates.reduce((d1, d2) => {
				if (!d1) {
					return d2;
				}
				return {
					startDate: d1.startDate < d2.startDate ? d1.startDate : d2.startDate,
					endDate: d1.endDate > d2.startDate ? d1.endDate : d2.endDate,
				};
			}, null))
			.then(date => ({ startDate: date.startDate.toISOString(), endDate: date.endDate.toISOString() }));

		return Observable.from(startEnd);
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	}
}

export function filterFilter(whiteFilter: OverlayFilter, blackFilters: OverlayFilter[]): OverlayFilter[] {
	let filters = [whiteFilter];

	if (blackFilters.length === 0) {
		return filters;
	}

	const newBlackFilters = Array.from(blackFilters);
	const blackFilter = newBlackFilters.shift();

	if (blackFilter.sensor === whiteFilter.sensor &&
		area(intersect(whiteFilter.coverage, blackFilter.coverage)) > 0) {

		filters = [];

		const newCoverage = difference(whiteFilter.coverage, blackFilter.coverage);

		const whiteDate = whiteFilter.timeRange;
		const blackDate = blackFilter.timeRange;

		if (blackDate.start && (!whiteDate.start || whiteDate.start < blackDate.start)) {
			filters.push({
				coverage: whiteFilter.coverage,
				sensor: whiteFilter.sensor,
				timeRange: { start: whiteDate.start, end: blackDate.start }
			});
		}

		if (blackDate.end && (!whiteDate.end || whiteDate.end < blackDate.end)) {
			filters.push({
				coverage: whiteFilter.coverage,
				sensor: whiteFilter.sensor,
				timeRange: { start: blackDate.end, end: whiteDate.end }
			});
		}

		if (area(newCoverage) > 0) {
			filters.push({
				coverage: newCoverage,
				sensor: whiteFilter.sensor,
				timeRange: blackDate
			});
		}
	}

	return filters
		.map(filter => filterFilter(filter, newBlackFilters))
		.reduce((a, b) => a.concat(b), []);
}
