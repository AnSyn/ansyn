import { BaseOverlaySourceProvider, StartAndEndDate } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlaysState, OverlayDrop, TimelineRange } from '../reducers/overlays.reducer';
import { OverlaysCriteria, OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig } from '../models/overlays.config';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { union } from 'lodash';
import { FavoritesModel, FilterModel } from '@ansyn/core/models/filter.model';
import { sortByDate, sortByDateDesc } from '@ansyn/core/utils/sorting';

export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

@Injectable()
export class OverlaysService {

	static buildFilteredOverlays(overlays: Overlay[], parsedFilters: FilterModel[], favorites: FavoritesModel): string[] {
		let parsedOverlays: Overlay[] = favorites.overlays;
		if (!favorites.only) {
			const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
			parsedOverlays = [...parsedOverlays, ...filteredOverlays];
		}
		parsedOverlays.sort(sortByDate);
		return union(parsedOverlays.map(({ id }) => id));
	}

	static isFullOverlay(overlay: Overlay): boolean {
		return Boolean(overlay && overlay.date);
	}

	/**
	 * function to return specific fields from overlay given ids object if properties is empty it returns all of the object;
	 * @param {Map<string, T>} items
	 * @param {string[]} ids
	 * @param {string[]} properties
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
		return [ ...overlaysData, ...Array.from(specialObjects.values()) ];
	}

	get fetchLimit() {
		return (this.config) ? this.config.limit : null;
	}

	constructor(@Inject(OverlaysConfig) public config: IOverlaysConfig,
				protected _overlaySourceProvider: BaseOverlaySourceProvider) {
	}

	search(params: OverlaysCriteria): Observable<OverlaysFetchData> {
		let feature = params.region;
		return this._overlaySourceProvider.fetch({
			limit: this.config.limit,
			region: feature,
			timeRange: <any> {
				start: params.time.from,
				end: params.time.to
			}
		});
	}

	getOverlayById(id: string, sourceType: string): Observable<Overlay> {
		return this._overlaySourceProvider.getById(id, sourceType);
	}

	getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<StartAndEndDate> {
		return this._overlaySourceProvider.getStartDateViaLimitFacets(params);
	}

	getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return this._overlaySourceProvider.getStartAndEndDateViaRangeFacets(params);
	}

	getTimeStateByOverlay(displayedOverlay: OverlayDrop, timeLineRange: TimelineRange): TimelineRange {
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

	private getTenth(timeLineRange: TimelineRange): number {
		let { start, end } = timeLineRange;
		const delta: number = end.getTime() - start.getTime();
		return delta === 0 ? 5000 : (delta) * 0.05;
	}

	private expendByTenth(timeLineRange: TimelineRange) {
		const tenth = this.getTenth(timeLineRange);
		return {
			start: new Date(timeLineRange.start.getTime() - tenth),
			end: new Date(timeLineRange.end.getTime() + tenth)
		};
	}


	getTimeRangeFromDrops(drops: Array<OverlayDrop>): TimelineRange {
		let start = drops[0].date;
		let end = drops[0].date;
		drops.forEach(drop => {
			start = drop.date < start ? drop.date : start;
			end = drop.date > end ? drop.date : end;
		});
		return this.expendByTenth({ start, end });

	}
}
