import { BaseOverlaySourceProvider, IStartAndEndDate } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IOverlay, IOverlaysCriteria, IOverlaysFetchData } from '@ansyn/core';
import { IOverlayDropSources, ITimelineRange, OverlayDrop } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import { unionBy } from 'lodash';
import { mapValuesToArray } from 'src/app/@ansyn/core/public_api';

export const OverlaysConfig = 'overlaysConfig';

// @dynamic
@Injectable()
export class OverlaysService {
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

	static parseOverlayDataForDisplay({ overlaysArray, filteredOverlays, specialObjects, favoriteOverlays, showOnlyFavorites }: IOverlayDropSources): OverlayDrop[] {
		const criterialOverlays: IOverlay[] = showOnlyFavorites ? [] :
			overlaysArray.filter(({ id }) => filteredOverlays.includes(id));
		const allOverlays: IOverlay[] = unionBy( criterialOverlays, favoriteOverlays, ({id}) => id);
		const dropsFromOverlays: OverlayDrop[] = allOverlays.map(({id, date}) => ({id, date}));
		const allDrops = [...dropsFromOverlays, ...mapValuesToArray(specialObjects)];
		return allDrops;
	}

	get fetchLimit() {
		return (this.config) ? this.config.limit : null;
	}

	constructor(@Inject(OverlaysConfig) public config: IOverlaysConfig,
				protected _overlaySourceProvider: BaseOverlaySourceProvider) {
	}

	search(params: IOverlaysCriteria): Observable<IOverlaysFetchData> {
		let feature = params.region;
		return this._overlaySourceProvider.fetch({
			dataInputFilters: Boolean(params.dataInputFilters) && params.dataInputFilters.active ? params.dataInputFilters.filters : null,
			limit: this.config.limit,
			region: feature,
			timeRange: <any> {
				start: params.time.from,
				end: params.time.to
			}
		});
	}

	getOverlayById(id: string, sourceType: string): Observable<IOverlay> {
		return this._overlaySourceProvider.getById(id, sourceType);
	}

	getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<IStartAndEndDate> {
		return this._overlaySourceProvider.getStartDateViaLimitFacets(params);
	}

	getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return this._overlaySourceProvider.getStartAndEndDateViaRangeFacets(params);
	}

	getTimeStateByOverlay(displayedOverlay: OverlayDrop, timeLineRange: ITimelineRange): ITimelineRange {
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


	getTimeRangeFromDrops(drops: Array<OverlayDrop>): ITimelineRange {
		let start = drops[0].date;
		let end = drops[0].date;
		drops.forEach(drop => {
			start = drop.date < start ? drop.date : start;
			end = drop.date > end ? drop.date : end;
		});
		return this.expendByTenth({ start, end });

	}
}
