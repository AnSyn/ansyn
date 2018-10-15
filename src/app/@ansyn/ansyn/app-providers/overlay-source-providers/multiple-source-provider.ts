import { forkJoin, from, Observable, throwError } from 'rxjs';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BaseOverlaySourceProvider, IDateRange, IFetchParams, IOverlayFilter, IStartAndEndDate } from '@ansyn/overlays';
import { IDataInputFilterValue, IOverlay, IOverlaysFetchData, LoggerService } from '@ansyn/core';
import { Feature, Polygon } from 'geojson';
import { area, difference, intersect } from '@turf/turf';
import { map } from 'rxjs/operators';
import { Auth0Service } from '../imisight/auth0.service';

export interface IFiltersList {
	name: string,
	dates: IDateRange[]
	sensorNames: string,
	coverage: number[][][][]
}

export interface IOverlaysSourceProvider {
	inActive?: boolean,
	whitelist: IFiltersList[],
	blacklist: IFiltersList[]
}

export interface IMultipleOverlaysSourceConfig {
	defaultProvider: IOverlaysSourceProvider;

	[key: string]: IOverlaysSourceProvider;
}

export type IMultipleOverlaysSources = BaseOverlaySourceProvider;

export const MultipleOverlaysSourceConfig = 'multipleOverlaysSourceConfig';
export const MultipleOverlaysSource: InjectionToken<IMultipleOverlaysSources> = new InjectionToken('multiple-overlays-sources');

@Injectable()
export class MultipleOverlaysSourceProvider extends BaseOverlaySourceProvider {

	private sourceConfigs: Array<{ filters: IOverlayFilter[], provider: BaseOverlaySourceProvider }> = [];

	constructor(@Inject(MultipleOverlaysSourceConfig) protected multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				@Inject(MultipleOverlaysSource) protected overlaysSources: IMultipleOverlaysSources[],
				protected loggerService: LoggerService,
				protected auth0Service: Auth0Service) {
		super(loggerService);

		this.prepareWhitelist();
	}

	private coverageToFeature(coordinates: number[][][]): Feature<Polygon> {
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
		const mapProviderConfig = (provider) => {
			const type = provider.sourceType;
			let config = this.multipleOverlaysSourceConfig[type];
			if (!config) {
				console.warn(`Missing config for provider ${type}, using defaultProvider config`);
				config = this.multipleOverlaysSourceConfig.defaultProvider;
			}
			return [provider, config];
		};

		const filterWhiteList = ([provider, { inActive }]: [IMultipleOverlaysSources, IOverlaysSourceProvider]) => !inActive;

		this.overlaysSources.map(mapProviderConfig).filter(filterWhiteList).forEach(([provider, config]) => {

			let whiteFilters = [];

			// Separate all sensors, date ranges, and polygons
			config.whitelist.forEach(filter => {
				JSON.parse(filter.sensorNames).forEach(sensor => {
					filter.coverage.forEach(polygon => {
						filter.dates.forEach(date => {
							const dateObj = {
								start: date.start ? new Date(date.start) : null,
								end: date.end ? new Date(date.end) : null
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
					JSON.parse(filter.sensorNames).forEach(sensor => {
						filter.coverage.forEach(polygon => {
							filter.dates.forEach(date => {
								const dateObj = {
									start: date.start ? new Date(date.start) : null,
									end: date.end ? new Date(date.end) : null
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

	public getById(id: string, sourceType: string): Observable<IOverlay> {
		const overlaysSource = this.overlaysSources.find(s => s.sourceType === sourceType);
		if (overlaysSource) {
			return overlaysSource.getById(id, sourceType);
		}
		return throwError(`Cannot find overlay for source = ${sourceType} id = ${id}`);
	}

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {

		if (this.auth0Service.auth0Active && !this.auth0Service.isValidToken()) {
			this.auth0Service.login();
			return;
		}

		const mergedSortedOverlays: Observable<IOverlaysFetchData> = forkJoin(this.sourceConfigs
			.filter(s => !Boolean(fetchParams.dataInputFilters) ? true : fetchParams.dataInputFilters.some((dataInputFilter: IDataInputFilterValue) => dataInputFilter.providerName === s.provider.sourceType))
			.map(s => {
				const dataFiltersOfProvider = Boolean(fetchParams.dataInputFilters) ?
					fetchParams.dataInputFilters.filter((f) => f.providerName === s.provider.sourceType) : [];
				return s.provider.fetchMultiple({ ...fetchParams, dataInputFilters: dataFiltersOfProvider }, s.filters);
			})).pipe(
			map(overlays => {
				const allFailed = overlays.every(overlay => this.isFaulty(overlay));
				const errors = this.mergeErrors(overlays);

				if (allFailed) {
					return {
						errors,
						data: null,
						limited: -1
					};
				}

				return this.mergeOverlaysFetchData(overlays, fetchParams.limit, errors);
			})); // merge the overlays

		return mergedSortedOverlays;
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<IStartAndEndDate> {
		const startEnd = Promise.all(this.sourceConfigs
			.map(s => s.provider.getStartDateViaLimitFacets(params).toPromise().catch(() => null)))
			.then(dates => dates.filter(Boolean)
			// filter(Boolean) prevents crash from providers that do not yet implement the current function
				.map(d => ({ startDate: new Date(d.startDate), endDate: new Date(d.endDate) })))
			.then(dates => dates.reduce((d1, d2) => {
				if (!d1) {
					return d2;
				}
				return {
					startDate: d1.startDate < d2.startDate ? d1.startDate : d2.startDate,
					endDate: d1.endDate > d2.startDate ? d1.endDate : d2.endDate
				};
			}, null))
			.then(date => ({ startDate: date.startDate.toISOString(), endDate: date.endDate.toISOString() }));

		return from(startEnd);
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		const startEnd = Promise.all(this.sourceConfigs
			.map(s => s.provider.getStartAndEndDateViaRangeFacets(params).toPromise().catch(() => null)))
			.then(dates => dates.filter(Boolean)
			// filter(Boolean) prevents crash from providers that do not yet implement the current function
				.map(d => ({ startDate: new Date(d.startDate), endDate: new Date(d.endDate) })))
			.then(dates => dates.reduce((d1, d2) => {
				if (!d1) {
					return d2;
				}
				return {
					startDate: d1.startDate < d2.startDate ? d1.startDate : d2.startDate,
					endDate: d1.endDate > d2.startDate ? d1.endDate : d2.endDate
				};
			}, null))
			.then(date => ({ startDate: date.startDate.toISOString(), endDate: date.endDate.toISOString() }));

		return from(startEnd);
	}
}

export function filterFilter(whiteFilter: IOverlayFilter, blackFilters: IOverlayFilter[]): IOverlayFilter[] {
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
