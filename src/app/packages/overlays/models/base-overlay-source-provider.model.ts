import { Overlay } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';

export interface IFetchParams {
	region: GeoJSON.DirectGeometryObject;
	timeRange: {
		start: Date,
		end: Date
	};
}

export abstract class BaseOverlaySourceProvider {
	sourceType: string;

	abstract fetch(fetchParams: IFetchParams): Observable<Overlay[]>;

	abstract getStartDateViaLimitFasets(params: { facets, limit, region }): Observable<any>;

	abstract getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any>;

	abstract getById(id: string): Observable<Overlay>;
}
