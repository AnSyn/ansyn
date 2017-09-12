import { BaseOverlaySourceProvider } from '../models/base-overlay-source-provider.model';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '../models/overlay.model';
import { IOverlayState } from '../reducers/overlays.reducer';
import { IOverlaysConfig } from '../models/overlays.config';
import { isEqual, isNil } from 'lodash';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


import * as bbox from '@turf/bbox';
import * as bboxPolygon from '@turf/bbox-polygon';
import { OverlaySpecialObject } from '../../core/models/overlay.model';


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
	 * @param {Map<any, any>} overlays
	 * @param ids
	 * @param properties
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

	constructor(@Inject(OverlaysConfig) private config: IOverlaysConfig, private _overlaySourceProvider: BaseOverlaySourceProvider) {
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

	getStartDateViaLimitFasets(params: { facets, limit, region }): Observable<any> {
		return this._overlaySourceProvider.getStartDateViaLimitFasets(params);
	}


	parseOverlayDataForDispaly(overlays: Map<string, Overlay>, ids, specialObject?: Map<string, OverlaySpecialObject>): Array<any> {
		const overlaysData = OverlaysService.pluck(overlays, ids, ['id', 'date']);

		if (specialObject) {
			specialObject.forEach((value) => {
				overlaysData.push(value);
			});
		}

		return [{ name: undefined, data: overlaysData }];
	}

	/*parseOverlayDataForDispalyWithFilters(overlays , filters: { filteringParams: any, filterFunc: (ovrelay: any, filteringParams: any) => boolean }[]){
		const overlaysData = OverlaysService.pluck(OverlaysService.sort(OverlaysService.filter(overlays,filters)),["id","date"]);
		return [{ name: undefined, data: overlaysData }];
	}*/

	compareOverlays(data: IOverlayState, data1: IOverlayState) {
		const result = isEqual(data.filteredOverlays, data1.filteredOverlays)
			&& isEqual(data.filters, data1.filters)
			&& isEqual(data.specialObjects, data1.specialObjects);
		return result;
	}

	getTimeStateByOverlay(displayedOverlay: Overlay, timelineState: { from: Date, to: Date }): { from: Date, to: Date } {
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
