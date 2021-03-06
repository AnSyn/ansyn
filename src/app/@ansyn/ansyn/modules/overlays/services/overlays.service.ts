import { Inject, Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import {
	IOverlayDropSources,
	ITimelineRange,
	selectFourViewsOverlays,
	selectOverlaysMap
} from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import { flattenDeep, flatten } from 'lodash';
import { MultipleOverlaysSourceProvider } from './multiple-source-provider';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectFavoriteOverlays } from '../overlay-status/reducers/overlay-status.reducer';
import { sortByDateDesc } from '../../core/utils/sorting';
import { mapValuesToArray } from '../../core/utils/misc';
import {
	IFourViews,
	IFourViewsConfig,
	fourViewsConfig,
	IOverlay,
	IOverlayDrop,
	IOverlaysCriteria,
	IOverlaysFetchData
} from '../models/overlay.model';
import {
	IMultipleOverlaysSourceConfig,
	IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../core/models/multiple-overlays-source-config';

export const OverlaysConfig = 'overlaysConfig';

export interface IOverlayByIdMetaData {
	id: string;
	sourceType: string
}

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class OverlaysService {

	get fetchLimit() {
		return (this.config) ? this.config.limit : null;
	}

	/**
	 * @description Observable: get a map with both query overlays and favorite overlays
	 */
	getAllOverlays$: Observable<Map<string, IOverlay>> = combineLatest([this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays), this.store$.select(selectFourViewsOverlays)]).pipe(
		map(([queryOverlays, favoriteOverlays, fourViewsOverlays]: [Map<string, IOverlay>, IOverlay[], IFourViews]) => {
			const result = new Map(queryOverlays);
			favoriteOverlays.forEach(overlay => {
				result.set(overlay.id, overlay);
			});

			const allFourViewsOverlays = this.getAllFourViewsOverlays(fourViewsOverlays);
			allFourViewsOverlays.forEach(overlay => result.set(overlay.id, overlay));
			return result;
		})
	);

	constructor(@Inject(OverlaysConfig) public config: IOverlaysConfig,
				@Inject(fourViewsConfig) public fourViewsConfig: IFourViewsConfig,
				@Inject(MultipleOverlaysSourceConfig) protected multipleOverlays: IMultipleOverlaysSourceConfig,
				protected _overlaySourceProvider: MultipleOverlaysSourceProvider,
				protected store$: Store<any>) {
	}

	/**
	 * function to return specific fields from overlay given ids object if properties is empty it returns all of the object;
	 * @param items
	 * @param ids
	 * @param properties
	 */
	static pluck<T>(items: Map<string, T>, ids: string[], properties: string[]) {
		return ids
			.map<T>((id) => items.get(id))
			.filter((item: T) => Boolean(item))
			.map((item: T) => {
				if (!properties.length) {
					return item;
				}
				return properties.reduce((obj, property) => {
					obj[property] = item[property];
					return obj;
				}, {});
			});
	}

	static parseOverlayDataForDisplay({ overlaysArray, filteredOverlays, specialObjects, favoriteOverlays, showOnlyFavorites }: IOverlayDropSources): IOverlayDrop[] {
		const criteriaOverlays: IOverlay[] = showOnlyFavorites ? favoriteOverlays : overlaysArray.filter(({ id }) => filteredOverlays.includes(id));
		const favoriteOverlayIds: string[] = favoriteOverlays.map(({ id }) => id);
		const drops: IOverlayDrop[] = criteriaOverlays.map(({ id, date, sensorName, icon, resolution }) => ({
			id,
			date,
			sensorName,
			icon,
			favorite: favoriteOverlayIds.includes(id),
			resolution: resolution || 0
		}));
		const allDrops = [...drops, ...mapValuesToArray(specialObjects)].sort(sortByDateDesc);
		return allDrops;
	}

	search(params: IOverlaysCriteria): Observable<IOverlaysFetchData> {
		let feature = params.region.geometry;
		return this._overlaySourceProvider.fetch({
			limit: this.config.limit,
			region: feature,
			timeRange: <any>{
				start: params.time.from,
				end: params.time.to
			},
			sensors: params.advancedSearchParameters.sensors || null,
			registeration: params.advancedSearchParameters.registeration || null,
			resolution: params.advancedSearchParameters.resolution || null,
			types: params.advancedSearchParameters.types || null,
			displayTrainer: params.advancedSearchParameters.displayTrainer
		});
	}

	sortOverlaysByPrioritySensor(overlays: IOverlay[]): void {
		overlays.sort((a, b) => (+a.sensorName.includes(this.fourViewsConfig.prioritySensor)) - (+b.sensorName.includes(this.fourViewsConfig.prioritySensor)));
	}

	getOverlayById(id: string, sourceType: string): Observable<IOverlay> {
		return this._overlaySourceProvider.getById(id, sourceType);
	}

	getOverlaysById(ids: IOverlayByIdMetaData[]): Observable<IOverlay[]> {
		return this._overlaySourceProvider.getByIds(ids);
	}

	getAllSensorsNames(isFourViewsModeActive?: boolean): any[] {
		if (isFourViewsModeActive) {
			return this.fourViewsConfig.sensors;
		}

		let sensors: any[] = [];
		const sensorNamesByGroup = this.multipleOverlays.sensorNamesByGroup;
		if (sensorNamesByGroup) {
			const typesNames = Object.keys(sensorNamesByGroup);
			typesNames.forEach(type => sensors = sensors.concat(sensorNamesByGroup[type]));
		}
		return flattenDeep(sensors);
	}

	getActiveProviders(): any[] {
		return Object.entries(this.multipleOverlays.indexProviders)
		.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive);
	}

	getTimeStateByOverlay(displayedOverlay: IOverlayDrop, timeLineRange: ITimelineRange): ITimelineRange {
		let { start, end } = timeLineRange;
		const startTime = start.getTime();
		const endTime = end.getTime();
		const dropTime = displayedOverlay.date.getTime();
		const deltaTenth = this.getTenth(timeLineRange);
		const dropTimeMarging = {
			start: dropTime - deltaTenth,
			end: dropTime + deltaTenth
		};
		if (dropTimeMarging.start < startTime) {
			start = new Date(dropTimeMarging.start);
		} else if (dropTimeMarging.end > endTime) {
			end = new Date(dropTimeMarging.end);
		}
		return { start, end };
	}

	private getTenth(timeLineRange: ITimelineRange): number {
		let { start, end } = timeLineRange;
		const delta: number = end.getTime() - start.getTime();
		return delta === 0 ? 5000 : (delta) * 0.05;
	}

	private expendByTenth(timeLineRange: ITimelineRange) {
		const tenth = this.getTenth(timeLineRange);
		return {
			start: new Date(timeLineRange.start.getTime() - tenth),
			end: new Date(timeLineRange.end.getTime() + tenth)
		};
	}

	getTimeRangeFromDrops(drops: Array<IOverlayDrop>): ITimelineRange {
		let start = drops[0].date;
		let end = drops[0].date;
		drops.forEach(drop => {
			start = drop.date < start ? drop.date : start;
			end = drop.date > end ? drop.date : end;
		});
		return this.expendByTenth({ start, end });

	}

	getThumbnailUrl(overlay, position): Observable<any> {
		return this._overlaySourceProvider.getThumbnailUrl(overlay, position)
	}

	getThumbnailName(overlay): string {
		return this._overlaySourceProvider.getThumbnailName(overlay)
	}

	getAllFourViewsOverlays(fourViewsOverlays: IFourViews): IOverlay[] {
		return flatten(Object.keys(fourViewsOverlays).map(key => fourViewsOverlays[key]));
	}
}
