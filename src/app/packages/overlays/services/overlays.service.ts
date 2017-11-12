import { BaseOverlaySourceProvider } from '../models/base-overlay-source-provider.model';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlaysState, TimelineState } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import { isEqual, isNil } from 'lodash';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';


export const OverlaysConfig: InjectionToken<IOverlaysConfig> = new InjectionToken('overlays-config');

@Injectable()
export class OverlaysService {

	static filter(overlays: Map<string, Overlay>, filters: { filteringParams: any, filterFunc: (ovrelay: any, filteringParams: any) => boolean }[]): string[] {
		if (isNil(overlays)) {
			return [];
		}

		const overlaysData = [];

		if (!filters || !Array.isArray(filters)) {
			return Array.from(overlays.keys());

		}
		overlays.forEach(overlay => {
			if (filters.every(filter => filter.filterFunc(overlay, filter.filteringParams))) {
				overlaysData.push(overlay.id);
			}
		});

		return overlaysData;
	}

	static sort(overlays: any[]): Overlay[] {
		if (isNil(overlays)) {
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

	/**
	 * function to return specific fields from overlay given ids object if properties is empty it returns all of the object;
	 * @param {Map<string, T>} items
	 * @param {string[]} ids
	 * @param {string[]} properties
	 */
	static pluck<T>(items: Map<string, T>, ids: string[], properties: string[]) {
		return ids.map(id => {
			const item = items.get(id);
			if (!properties.length) {
				return item;
			}
			return properties.reduce((obj, property) => {
				obj[property] = item[property];
				return obj;
			}, {});
		});
	}


	static parseOverlayDataForDispaly({ overlays, filteredOverlays, specialObjects }: IOverlaysState): Array<any> {
		const overlaysData = OverlaysService.pluck(overlays, filteredOverlays, ['id', 'date']);

		specialObjects.forEach((value) => {
			overlaysData.push(value);
		});

		return [{ name: undefined, data: overlaysData }];
	}

	constructor(@Inject(OverlaysConfig) protected config: IOverlaysConfig, protected _overlaySourceProvider: BaseOverlaySourceProvider) {
	}

	search(params: any = {}): Observable<Array<Overlay>> {
		let tBbox = bbox(params.polygon);
		let tBboxFeature = bboxPolygon(tBbox);
		return this._overlaySourceProvider.fetch({
			region: tBboxFeature.geometry,
			timeRange: {
				start: params.from,
				end: params.to
			}
		});
	}

	getOverlayById(id: string): Observable<Overlay> {
		return this._overlaySourceProvider.getById(id);
	}

	getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return this._overlaySourceProvider.getStartDateViaLimitFacets(params);
	}

	getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return this._overlaySourceProvider.getStartAndEndDateViaRangeFacets(params);
	}

	compareOverlays(data: IOverlaysState, data1: IOverlaysState) {
		return isEqual(data.filteredOverlays, data1.filteredOverlays)
			&& isEqual(data.filters, data1.filters)
			&& isEqual(data.specialObjects, data1.specialObjects);
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
