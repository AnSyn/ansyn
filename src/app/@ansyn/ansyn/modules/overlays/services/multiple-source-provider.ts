import { forkJoin, Observable, throwError } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IOverlayFilter,
	isFaulty,
	mergeErrors,
	mergeOverlaysFetchData
} from '../models/base-overlay-source-provider.model';
import { Feature, Polygon } from 'geojson';
import { area, difference, intersect } from '@turf/turf';
import { map, take, tap } from 'rxjs/operators';
import { filter, groupBy } from 'lodash';
import { IOverlayByIdMetaData } from './overlays.service';
import { IMultipleOverlaysSource, MultipleOverlaysSource } from '../models/overlays-source-providers';
import { forkJoinSafe } from '../../core/utils/rxjs/observables/fork-join-safe';
import { mergeArrays } from '../../core/utils/merge-arrays';
import {
	IMultipleOverlaysSourceConfig,
	IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../core/models/multiple-overlays-source-config';
import { IOverlay, IOverlaysCriteria, IOverlaysFetchData } from '../models/overlay.model';
import { select, Store } from '@ngrx/store';
import { IAdvancedSearchParameter, IProviderData, IStatusBarConfig } from '../../status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '../../status-bar/models/statusBar.config';
import { selectOverlaysCriteria, selectProviders } from '../reducers/overlays.reducer';

@Injectable({
	providedIn: 'root'
})
export class MultipleOverlaysSourceProvider {
	
	private providers: IProviderData[];
	private selectedProviders: IProviderData[];

	onDataInputFilterChange$ = this.store.pipe(
		select(selectProviders),
		tap((providers: IProviderData[]) => {
			this.activeProviders(providers);
		})
	);

	
	constructor(@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) protected multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				@Inject(MultipleOverlaysSource) public overlaysSources: IMultipleOverlaysSource) {
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

	getThumbnailUrl(overlay, position): Observable<any> {
		const overlaysSource = this.overlaysSources[overlay.sourceType];
		if (overlaysSource) {
			return overlaysSource.getThumbnailUrl(overlay, position);
		}
		return throwError(`Cannot find overlay for source = ${ overlay.sourceType } id = ${ overlay.id }`);
	}

	getThumbnailName(overlay): string {
		const overlaysSource = this.overlaysSources[overlay.sourceType];
		if (overlaysSource) {
			return overlaysSource.getThumbnailName(overlay);
		}
		return '';
	}

	private mapProviderConfig(provider) {
		const type = provider.sourceType;
		let config = this.multipleOverlaysSourceConfig.indexProviders[type];
		if (!config) {
			console.warn(`Missing config for provider ${ type }, using defaultProvider config`);
			config = this.multipleOverlaysSourceConfig.defaultProvider;
		}
		return [provider, config];
	};

	private filterOnSelectedProviders([provider, { inActive }]: [BaseOverlaySourceProvider, IOverlaysSourceProvider]) {
		return !inActive;
	}

	private prepareAllActiveProvidersArray() {
		const rawProviders = Object.values(this.overlaysSources);
		this.providers = rawProviders.map(provider => this.mapProviderConfig(provider)).filter(this.filterOnSelectedProviders).map(([provider, config]) => {
				return {
					name: provider.sourceType,
					class: provider
				};
		});
	}

	private activeProviders(providersFromState) {
		this.prepareAllActiveProvidersArray();

		this.selectedProviders = [];
		this.selectedProviders.push(...providersFromState.map(providerFromState => {
			return this.providers.find(provider => providerFromState.name === provider.name);
		}));
	}

	public getById(id: string, sourceType: string): Observable<IOverlay> {
		const overlaysSource = this.overlaysSources[sourceType];
		if (overlaysSource) {
			return overlaysSource.getById(id, sourceType);
		}
		return throwError(`Cannot find overlay for source = ${ sourceType } id = ${ id }`);
	}

	getByIds(ids: IOverlayByIdMetaData[]): Observable<IOverlay[]> {
		const grouped = groupBy(ids, 'sourceType');
		const observables = Object.entries(grouped)
			.map(([sourceType, ids]): Observable<IOverlay[]> => {
				const overlaysSource = this.overlaysSources[sourceType];
				if (overlaysSource) {
					return overlaysSource.getByIds(ids);
				}
				return throwError(`Cannot find overlay for source = ${ sourceType }`);
			});

		return forkJoinSafe(observables).pipe(map(mergeArrays));
	}

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		this.onDataInputFilterChange$.pipe(take(1)).subscribe();
		const mergedSortedOverlays: Observable<IOverlaysFetchData> = forkJoin(this.selectedProviders
			.map(selctedProvider =>  selctedProvider.class.fetchMultiple(fetchParams))).pipe(
			map(overlays => {
				const allFailed = overlays.every(overlay => isFaulty(overlay));
				const errors = mergeErrors(overlays);

				if (allFailed) {
					return {
						errors,
						data: null,
						limited: -1
					};
				}

				return mergeOverlaysFetchData(overlays, fetchParams.limit, errors);
			})); // merge the overlays

		return mergedSortedOverlays;
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

	return mergeArrays(filters
		.map(filter => filterFilter(filter, newBlackFilters))
	);
}
