import { BaseOverlaySourceProvider, IStartAndEndDate } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { IOverlay } from '../models/overlay.model';
import { IOverlaysState, ITimelineRange, OverlayDrop } from '../reducers/overlays.reducer';
import { IOverlaysCriteria, IOverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig } from '../models/overlays.config';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { union } from 'lodash';
import { IFilterModel } from '@ansyn/core/models/IFilterModel';
import { sortByDateDesc } from '@ansyn/core/utils/sorting';

export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

// @dynamic
@Injectable()
export class OverlaysService {

	static buildFilteredOverlays(overlays: IOverlay[], parsedFilters: IFilterModel[], favorites: IOverlay[], showOnlyFavorite: boolean, removedOverlaysIds: string[], removedOverlaysVisibility: boolean): string[] {
		let parsedOverlays: IOverlay[] = favorites;
		if (!showOnlyFavorite) {
			const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
			parsedOverlays = [...parsedOverlays, ...filteredOverlays];
		}

		if (removedOverlaysVisibility) {
			parsedOverlays = parsedOverlays.filter((overlay) => !removedOverlaysIds.some((overlayId) => overlay.id === overlayId));
		}
		parsedOverlays.sort(sortByDateDesc);
		return union(parsedOverlays.map(({ id }) => id));
	}

	static isFullOverlay(overlay: IOverlay): boolean {
		return Boolean(overlay && overlay.date);
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


	static parseOverlayDataForDisplay({ overlays, filteredOverlays, specialObjects }: IOverlaysState): OverlayDrop[] {
		const overlaysData = OverlaysService.pluck(overlays, filteredOverlays, ['id', 'date']);
		return [...overlaysData, ...Array.from(specialObjects.values())];
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
