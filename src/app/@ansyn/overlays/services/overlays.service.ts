import { BaseOverlaySourceProvider, StartAndEndDate } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken, isDevMode } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlaysState, OverlayDrop, TimelineRange } from '../reducers/overlays.reducer';
import { OverlaysCriteria, OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig } from '../models/overlays.config';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { union } from 'lodash';
import { FilterModel } from '@ansyn/core/models/filter.model';
import { sortByDate, sortByDateDesc, sortByResolutionDesc } from '@ansyn/core/utils/sorting';
import { CaseIntervalCriteria, CaseTimeState } from '@ansyn/core/models/case.model';
import { Interval, IntervalTimeFrame } from '@ansyn/core/models/intervals.model';
import { times as doNTimes } from 'lodash';
import { IDateRange } from '@ansyn/core/models/time.model';

export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

@Injectable()
export class OverlaysService {
	static buildFilteredOverlays(overlays: Overlay[], parsedFilters: FilterModel[], favorites: Overlay[], showOnlyFavorite: boolean, timeState?: CaseTimeState): string[] {
		let parsedOverlays: Overlay[] = favorites;
		if (!showOnlyFavorite) {
			const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
			parsedOverlays = [...parsedOverlays, ...filteredOverlays];
		}

		if (timeState && timeState.intervals) {
			// interval  mode - limit overlays to be 1 per interval scope
			parsedOverlays = OverlaysService.intervalFilter(parsedOverlays, timeState);
		}

		parsedOverlays.sort(sortByDateDesc);
		return union(parsedOverlays.map(({ id }) => id));
	}

	/* start */
	// limit overlays to be 1 per interval scope
	static intervalFilter(overlays: Overlay[], timeState: CaseTimeState): Overlay[] {
		const tf: IntervalTimeFrame = OverlaysService.calculateTimeFrame(timeState);
		// create array of intervals (see Interval interface)
		const intervalsArrays: Array<Interval> = OverlaysService.createIntervalsArray(tf, timeState);

		// put each overlay in the right interval
		overlays = overlays.sort(sortByDate);
		let intervalIndex = 0;
		overlays.forEach(o => {
			// advance index until date is not exceeding interval end time
			while (o.date > intervalsArrays[intervalIndex].endTime && intervalIndex < intervalsArrays.length) {
				intervalIndex++;
			}
			const interval = intervalsArrays[intervalIndex];
			if (interval.startTime < o.date && o.date <= intervalsArrays[intervalIndex].endTime) {
				interval.overlays.push(o);
			} else {
				console.warn(`overlay does not match any interval. id:${o.id}. date: ${o.date}`, o);
			}
		});

		// return best-matching overlay by criteria
		let overlaysByCriteria = OverlaysService.overlaysByCriteria(intervalsArrays, timeState.intervals.criteria);

		if (isDevMode()) {	// log for debug purpose
			console.table(intervalsArrays.map((obj, ind) => {
				const match = overlaysByCriteria[ind];
				return {
					startTime: obj.startTime.toISOString().replace('T', ' '),
					endTime: obj.endTime.toISOString().replace('T', ' '),
					pivot: obj.pivot.toISOString().replace('T', ' '),
					overlays: obj.overlays.length,
					match: match ? `id: ${match.id} time: ${match.date.toISOString().replace('T', ' ')}` : 'none',
					by: timeState.intervals.criteria.type
				};
			}));
		}

		return overlaysByCriteria;
	}

	// calculate TimeFrame object
	static calculateTimeFrame(timeState: CaseTimeState): IntervalTimeFrame {
		const intervalSize = timeState.intervals.interval;
		const tf: IntervalTimeFrame = {
			startDate: timeState.from,
			endDate: timeState.to,
			span: timeState.to.getTime() - timeState.from.getTime(),
			intervalsCount: 0
		};

		// calculate how many intervals
		tf.intervalsCount = Math.floor(tf.span / intervalSize);

		// update time-frame (when time-frame % interval is not 0)
		if (tf.span % intervalSize > 0) {
			tf.startDate = new Date(tf.endDate.getTime() - (intervalSize * tf.intervalsCount));
			tf.span = tf.endDate.getTime() - tf.startDate.getTime();
		}
		return tf;
	}

	// create Array<Interval> by timeFrame and timeState
	static createIntervalsArray(timeFrame: IntervalTimeFrame, timeState: CaseTimeState): Array<Interval> {
		// set interval-size
		const intervalSize = timeState.intervals.interval;
		// initialize intervalsArrays
		const startTime = timeFrame.startDate.getTime();
		const intervalsArrays = new Array<Interval>();

		doNTimes(timeFrame.intervalsCount, intervalIndex => {
			let intervalStartMs = startTime + intervalIndex * intervalSize;
			let intervalEndTimeMs = intervalStartMs + intervalSize - 1;
			const intervalPivotTimeMs = intervalStartMs + intervalSize - 1;	// pivot is always the end of the original scope
			// manipulate interval according to criteria
			switch (timeState.intervals.criteria.type) {
				case 'best':
					// move interval scope limits around pivot, according to before/after values
					intervalStartMs = intervalPivotTimeMs - timeState.intervals.criteria.before;
					intervalEndTimeMs = intervalPivotTimeMs + timeState.intervals.criteria.after;
					break;
				case 'closest-after':
					// move interval scope limits so scope will start with pivot
					intervalStartMs = intervalPivotTimeMs;
					intervalEndTimeMs += intervalSize;
					break;
				case 'closest-both':
					// move interval scope limits so pivot will be in the middle of scope
					intervalStartMs += (intervalSize / 2);
					intervalEndTimeMs += (intervalSize / 2);
					break;
			}

			intervalsArrays.push({
				startTime: new Date(intervalStartMs),
				endTime: new Date(intervalEndTimeMs),
				pivot: new Date(intervalPivotTimeMs),
				overlays: []
			})
		});

		return intervalsArrays;
	}
	// select best-matching overlay by criteria
	static overlaysByCriteria(intervals: Array<any>, criteria: CaseIntervalCriteria): Overlay[] {
		const result: Overlay[] = [];

		// find the matching overlay for each interval by criteria
		intervals.forEach(interval => {
			let overlays = interval.overlays;
			// const pivot = interval.pivot
			if (overlays.length > 0) {
				switch (criteria.type) {
					case 'best':
						// remove overlay outside of interval best-scope (best-before/best-after)
						overlays = overlays.filter(o => {
							const overlayTime: number = o.date.getTime();
							const intervalLow: number = interval.pivot.getTime() - criteria.before;
							const intervalHigh: number = interval.pivot.getTime() + criteria.after;
							return intervalLow <= overlayTime && overlayTime <= intervalHigh;
						}).sort(sortByResolutionDesc);
						break;
					case 'closest-before':
						overlays = overlays.filter(o => o.date.getTime() <= interval.pivot.getTime())	// remove overlays after pivot
							.sort(sortByDateDesc);	// sort - latest first
						break;
					case 'closest-after':
						overlays = overlays.filter(o => o.date.getTime() >= interval.pivot.getTime())	// remove overlays before pivot
							.sort(sortByDate);	// sort - earliest first
						break;
					case 'closest-both':
						overlays = overlays.sort((o1, o2) => // sort - closest
							Math.abs(o1.date - interval.pivot.getTime()) - Math.abs(o1.date - interval.pivot.getTime()));
						break;
				}
				if (overlays.length > 0) {
					result.push(overlays[0]);
				}
			}
		});

		return result;
	}
	/* end */

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
		return [...overlaysData, ...Array.from(specialObjects.values())];
	}

	get fetchLimit() {
		return (this.config) ? this.config.limit : null;
	}

	constructor(@Inject(OverlaysConfig) public config: IOverlaysConfig,
				protected _overlaySourceProvider: BaseOverlaySourceProvider) {
	}

	search(params: OverlaysCriteria): Observable<OverlaysFetchData> {
		let feature = params.region;
		const timeRange: Array<IDateRange> = this.getSearchTimeRange(params.time);
		return this._overlaySourceProvider.fetch({
			dataInputFilters: Boolean(params.dataInputFilters) && params.dataInputFilters.active ? params.dataInputFilters.filters : null,
			limit: this.config.limit,
			region: feature,
			timeRange
		});
	}

	getSearchTimeRange(timeState: CaseTimeState): IDateRange[] {
		const searchTimeRange: IDateRange[] = [];

		if (!timeState.intervals) {
			searchTimeRange.push({
				start: timeState.from,
				end: timeState.to
			});
		} else {
			const tf: IntervalTimeFrame = OverlaysService.calculateTimeFrame(timeState);
			// create array of intervals (see Interval interface)
			const intervalsArrays: Array<Interval> = OverlaysService.createIntervalsArray(tf, timeState);
			intervalsArrays.forEach(interval => {
				searchTimeRange.push({
					start: interval.startTime,
					end: interval.endTime
				});
			});
		}
		return searchTimeRange;
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
