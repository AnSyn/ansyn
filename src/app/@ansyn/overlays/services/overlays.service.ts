import { BaseOverlaySourceProvider } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlaysState, TimelineRange } from '../reducers/overlays.reducer';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig } from '../models/overlays.config';
import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { OverlaysCriteria } from '@ansyn/core';
import { OverlayDrop } from '@ansyn/overlays';

export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

@Injectable()
export class OverlaysService {

	static filter(overlays: Map<string, Overlay>, filters: { key: any, filterFunc: (ovrelay: any, key: string) => boolean }[]): string[] {
		if (!overlays) {
			return [];
		}

		const overlaysData = [];

		if (!filters || !Array.isArray(filters)) {
			return Array.from(overlays.keys());

		}
		overlays.forEach(overlay => {
			if (filters.every(filter => filter.filterFunc(overlay, filter.key))) {
				overlaysData.push(overlay.id);
			}
		});

		return overlaysData;
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

	constructor(@Inject(OverlaysConfig) public config: IOverlaysConfig,
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
