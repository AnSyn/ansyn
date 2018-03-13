import { BaseOverlaySourceProvider } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken, isDevMode } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlaysState, TimelineState } from '../reducers/overlays.reducer';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig } from '../models/overlays.config';
import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { times as doNTimes } from 'lodash';
import { CaseIntervalCriteria, CaseTimeState, OverlaysCriteria } from '@ansyn/core';
import { sortByDateAsc, sortByDateDesc } from '@ansyn/core/utils/sorting';

export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

@Injectable()
export class OverlaysService {

	static filter(
		overlays: Map<string, Overlay>,
		filters: { key: any, filterFunc: (ovrelay: any, key: string) => boolean }[],
		timeState: CaseTimeState
	): string[] {
		if (!overlays) {
			return [];
		}

		let overlaysArray;
		if (!filters || !Array.isArray(filters)) {
			// no - filters
			overlaysArray = Array.from( overlays.values() );
		} else {
			// filters active
			overlaysArray = [];
			overlays.forEach(overlay => {
				if (filters.every(filter => filter.filterFunc(overlay, filter.key))) {
					overlaysArray.push(overlay);
				}
			});
		}

		if (timeState.intervals) {
			// interval  mode - limit overlays to be 1 per interval scope
			overlaysArray = OverlaysService.intervalFilter(overlaysArray, timeState);
		}

		return overlaysArray.length > 0 ? overlaysArray.map(o => o.id) : [];
	}

	// limit overlays to be 1 per interval scope
	static intervalFilter(overlays: Overlay[], timeState: CaseTimeState): Overlay[] {
		// set interval-size and time-frame
		const intervalSize = timeState.intervals.interval;
		const tf = {
			startDate: timeState.from,
			endDate: timeState.to,
			span: timeState.to.getTime() - timeState.from.getTime(),
		};

		// calculate how many intervals
		const howManyIntervals = Math.floor(tf.span / intervalSize);

		// update time-frame (when time-frame % interval is not 0)
		if (tf.span % intervalSize > 0) {
			tf.startDate = new Date(tf.endDate.getTime() - (intervalSize * howManyIntervals));
			tf.span = tf.endDate.getTime() - tf.startDate.getTime();
		}

		// initialize intervalsArrays
		const startTime = tf.startDate.getTime();
		const intervalsArrays = [];

		doNTimes(howManyIntervals, intervalIndex => {
			const intervalStartMs = startTime + intervalIndex * intervalSize;
			intervalsArrays.push({
				startTime: new Date(intervalStartMs),
				endTime: new Date(intervalStartMs + intervalSize - 1),
				pivot: new Date(intervalStartMs + intervalSize / 2 ),
				overlays: []
			})
		});

		// put each overlay in the right interval
		overlays.forEach(o => {
			const normalizedTime = o.date.getTime() - startTime;
			if (normalizedTime < 0) {
				console.warn(`overlay ${o.id} may be out of time-frame: ${tf.startDate} to ${tf.endDate}`, o);
			} else {
				const intervalIndex = Math.floor(normalizedTime / intervalSize);
				intervalsArrays[intervalIndex].overlays.push(o);
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
							const intervalLow: number = interval.pivot - criteria.before;
							const intervalHigh: number = interval.pivot + criteria.after;
							return intervalLow <= overlayTime && overlayTime <= intervalHigh;
						});
						// To do: sort by best;
						break;
					case 'closest-before':
						overlays = overlays.filter(o => o.date.getTime() >= interval.pivot)	// remove overlays after pivot
							.sort(sortByDateDesc);	// sort - latest first
						break;
					case 'closest-after':
						overlays = overlays.filter(o => o.date.getTime() <= interval.pivot)	// remove overlays before pivot
							.sort(sortByDateAsc);	// sort - earliest first
						break;
					case 'closest-both':
						overlays = overlays.sort((o1, o2) => // sort - closest
							Math.abs(o1.date - interval.pivot) - Math.abs(o1.date - interval.pivot));
						break;
				}
				if (overlays.length > 0) {
					result.push(overlays[0]);
				}
			}
		});

		return result;
	}

	static sort(overlays: any[]): Overlay[] {
		if (!overlays) {
			return [] as Overlay[];
		}
		return overlays
			.sort((o1, o2) => {
				if (o2.date < o1.date) {
					return 1;
				}
				if (o1.date < o2.date) {
					return -1;
				}
				return 0;
			});
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


	static parseOverlayDataForDisplay({ overlays, filteredOverlays, specialObjects }: IOverlaysState): Array<any> {
		const overlaysData = OverlaysService.pluck(overlays, filteredOverlays, ['id', 'date']);

		specialObjects.forEach((value) => {
			overlaysData.push(value);
		});

		return [{ name: undefined, data: overlaysData }];
	}

	get fetchLimit() {
		return (this.config) ? this.config.limit : null;
	}

	constructor(@Inject(OverlaysConfig) protected config: IOverlaysConfig,
				protected _overlaySourceProvider: BaseOverlaySourceProvider) {
	}

	search(params: OverlaysCriteria): Observable<OverlaysFetchData> {
		let tBbox = bbox(params.region);
		let tBboxFeature = bboxPolygon(tBbox);
		return this._overlaySourceProvider.fetch({
			limit: this.config.limit,
			region: tBboxFeature.geometry,
			timeRange: <any> {
				start: params.time.from,
				end: params.time.to
			}
		});
	}

	getOverlayById(id: string, sourceType: string): Observable<Overlay> {
		return this._overlaySourceProvider.getById(id, sourceType);
	}

	getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return this._overlaySourceProvider.getStartDateViaLimitFacets(params);
	}

	getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return this._overlaySourceProvider.getStartAndEndDateViaRangeFacets(params);
	}

	getTimeStateByOverlay(displayedOverlay: Overlay, timelineState: TimelineState): TimelineState {
		const delta: number = timelineState.to.getTime() - timelineState.from.getTime();
		const deltaTenth: number = (delta) * 0.1;
		let from: Date, to: Date;
		if (displayedOverlay.date < timelineState.from) {
			from = new Date(displayedOverlay.date.getTime() - deltaTenth);
			to = new Date(from.getTime() + delta);
		} else if (timelineState.to < displayedOverlay.date) {
			to = new Date(displayedOverlay.date.getTime() + deltaTenth);
			from = new Date(to.getTime() - delta);
		}
		return { from, to };
	}
}
