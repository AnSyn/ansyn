import { IStartAndEndDate } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { IOverlayDropSources, ITimelineRange, selectOverlaysMap } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import { unionBy } from 'lodash';
import { MultipleOverlaysSourceProvider } from './multiple-source-provider';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectFavoriteOverlays } from '../overlay-status/reducers/overlay-status.reducer';
import { sortByDateDesc, sortByDate } from '../../core/utils/sorting';
import { mapValuesToArray } from '../../core/utils/misc';
import { IOverlay, IOverlayDrop, IOverlaysCriteria, IOverlaysFetchData } from '../models/overlay.model';

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

	/**
	 * @description Observable: get a map with both query overlays and favorite overlays
	 */
	getAllOverlays$: Observable<Map<string, IOverlay>> = combineLatest(this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays)).pipe(
		map(([queryOverlays, favoriteOverlays]: [Map<string, IOverlay>, IOverlay[]]) => {
			const result = new Map(queryOverlays);
			favoriteOverlays.forEach(overlay => {
				result.set(overlay.id, overlay);
			});
			return result;
		})
	);

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
		const criterialOverlays: IOverlay[] = showOnlyFavorites ? [] :
			overlaysArray.filter(({ id }) => filteredOverlays.includes(id));
		const allOverlays: IOverlay[] = unionBy(criterialOverlays, favoriteOverlays, ({ id }) => id);
		const dropsFromOverlays: IOverlayDrop[] = allOverlays.map(({ id, date, sensorName, icon }) => ({ id, date, sensorName, icon }));
		const allDrops = [...dropsFromOverlays, ...mapValuesToArray(specialObjects)].sort(sortByDateDesc);
		return allDrops;
	}

	get fetchLimit() {
		return (this.config) ? this.config.limit : null;
	}

	constructor(@Inject(OverlaysConfig) public config: IOverlaysConfig,
				protected _overlaySourceProvider: MultipleOverlaysSourceProvider,
				protected store$: Store<any>) {
	}

	search(params: IOverlaysCriteria): Observable<IOverlaysFetchData> {
		let feature = params.region;
		return this._overlaySourceProvider.fetch({
			dataInputFilters: Boolean(params.dataInputFilters) ? params.dataInputFilters.filters : null,
			limit: this.config.limit,
			region: feature,
			timeRange: <any>{
				start: params.time.from,
				end: params.time.to
			},
			customSensorToFilter: params.dataInputFilters.customFiltersSensor
		});
	}

	getOverlayById(id: string, sourceType: string): Observable<IOverlay> {
		return this._overlaySourceProvider.getById(id, sourceType);
	}

	getOverlaysById(ids: IOverlayByIdMetaData[]): Observable<IOverlay[]> {
		return this._overlaySourceProvider.getByIds(ids);
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
}
